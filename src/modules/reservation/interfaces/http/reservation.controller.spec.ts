import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { AuthModule } from '../../../authentication/auth.module';
import { UserModule } from '../../../user/user.module';
import { RoomsModule } from '../../../rooms/room.module';
import { PropertiesModule } from '../../../properties/properties.module';
import { ReservationModule } from '../../reservation.module';
import { PropertyEntity } from '../../../properties/infrastructure/entities/property-entity.entity';
import { RoomEntity } from '../../../rooms/infrastructure/entities/room.entity';
import { RESERVATION_STATUS } from '../../domain/constants/reservation-status.constant';
import {
  AUTH_TEST_ENTITIES,
  DEFAULT_REGISTER,
  DOMAIN_TEST_ENTITIES,
  registerAndLoginAsSuperAdmin,
} from '../../../../test/controller-test.helpers';
import {
  getIntegrationTestDatabaseConfig,
  prepareIntegrationTestDatabase,
} from '../../../../test/test-database.config';
import { ReservationOrmEntity } from '../../infrastructure/entities/reservation.orm-entity';
import { PaymentOrmEntity } from '../../../payment/infrastructure/entities/payment.orm-entity';
import { PAYMENT_GATEWAY } from '../../../payment/domain/ports/payment-gateway.port';
import { createPaymentGatewayMock } from '../../../payment/applications/useCase/payment-test.helpers';
import { UserEntity } from '../../../user/infrastructure/entities/user.entity';

describe('ReservationController', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let token: string;
  let roomId: number;
  let propertyId: number;

  beforeAll(async () => {
    process.env.MAIL_TRANSPORT = 'console';
    await prepareIntegrationTestDatabase();

    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(
          getIntegrationTestDatabaseConfig([
            ...AUTH_TEST_ENTITIES,
            ...DOMAIN_TEST_ENTITIES,
            ReservationOrmEntity,
            PaymentOrmEntity,
          ]),
        ),
        JwtModule.register({
          global: true,
          secret: '1234',
          signOptions: { expiresIn: '5h' },
        }),
        AuthModule,
        UserModule,
        PropertiesModule,
        RoomsModule,
        ReservationModule,
      ],
    })
      .overrideProvider(PAYMENT_GATEWAY)
      .useValue(createPaymentGatewayMock())
      .compile();

    dataSource = moduleRef.get(DataSource);
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    token = await registerAndLoginAsSuperAdmin(app, dataSource);

    const user = await dataSource.getRepository(UserEntity).findOneBy({
      email: DEFAULT_REGISTER.email,
    });

    const property = await dataSource.getRepository(PropertyEntity).save({
      name: 'Hotel Test',
      description: 'Description',
      address: '1 rue Test',
      city: 'Paris',
      country: 'France',
      latitude: 0,
      longitude: 0,
      checkInTime: '15:00',
      checkOutTime: '11:00',
      ownerId: user!.id,
    });

    propertyId = property.id;

    const room = await dataSource.getRepository(RoomEntity).save({
      name: 'Suite',
      description: 'Grande suite',
      pricePerNight: 100,
      maxGuests: 2,
      bedrooms: 1,
      bathrooms: 1,
      beds: 1,
      quantity: 1,
      size: 30,
      status: 'available',
      property: { id: property.id },
    });

    roomId = room.id;
  });

  afterAll(async () => {
    await app?.close();
  });

  it('POST /reservations crée une réservation avec ses items', async () => {
    const response = await request(app.getHttpServer())
      .post('/reservations')
      .set('Authorization', `Bearer ${token}`)
      .send({
        roomId,
        startDate: '2026-09-01',
        endDate: '2026-09-03',
        guestCount: 2,
      })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        userId: expect.any(Number),
        status: RESERVATION_STATUS.PENDING,
        items: [
          expect.objectContaining({
            roomId,
            checkIn: '2026-09-01',
            checkOut: '2026-09-03',
            startDate: '2026-09-01',
            endDate: '2026-09-03',
            price: 200,
            nights: 2,
          }),
        ],
      }),
    );
  });

  it('GET /reservations/stats retourne les stats de réservation', async () => {
    const response = await request(app.getHttpServer())
      .get('/reservations/stats')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        activeCount: expect.any(Number),
        pendingCount: expect.any(Number),
        monthlyRevenue: expect.any(Number),
        occupancyRate: expect.any(Number),
        totalCount: expect.any(Number),
        recentActivity: expect.any(Array),
      }),
    );
  });

  it('GET /reservations retourne la liste admin', async () => {
    const response = await request(app.getHttpServer())
      .get('/reservations')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0].items?.[0]).toEqual(
      expect.objectContaining({
        startDate: expect.any(String),
        endDate: expect.any(String),
      }),
    );
  });

  it('GET /reservations/me retourne les réservations de l’utilisateur', async () => {
    const response = await request(app.getHttpServer())
      .get('/reservations/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0].items?.[0]).toEqual(
      expect.objectContaining({
        startDate: expect.any(String),
        endDate: expect.any(String),
      }),
    );
  });

  it('rejette une double réservation sur les mêmes dates', async () => {
    await request(app.getHttpServer())
      .post('/reservations')
      .set('Authorization', `Bearer ${token}`)
      .send({
        roomId,
        startDate: '2026-10-01',
        endDate: '2026-10-03',
        guestCount: 2,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/reservations')
      .set('Authorization', `Bearer ${token}`)
      .send({
        roomId,
        startDate: '2026-10-01',
        endDate: '2026-10-03',
        guestCount: 2,
      })
      .expect(400);
  });

  it('POST /reservations/cancel/:id annule une réservation', async () => {
    const payment = await dataSource.getRepository(PaymentOrmEntity).save({
      amount: 20000,
      currency: 'eur',
      status: 'succeeded',
      provider: 'stripe',
      transactionId: 'pi_cancel_test',
      userId: 1,
      propertyType: 'reservation',
      propertyId: 1,
    });

    const reservation = await dataSource
      .getRepository(ReservationOrmEntity)
      .save({
        userId: 1,
        status: RESERVATION_STATUS.CONFIRMED,
        payment,
        items: [
          {
            roomId,
            checkIn: '2026-10-01',
            checkOut: '2026-10-03',
            guestCount: 2,
            price: 200,
            nights: 2,
          },
        ],
      });

    const response = await request(app.getHttpServer())
      .post(`/reservations/cancel/${reservation.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        status: RESERVATION_STATUS.CANCELLED,
      }),
    );
  });

  it('GET /reservations/bookings/host liste les commandes host', async () => {
    const user = await dataSource.getRepository(UserEntity).findOneBy({
      email: DEFAULT_REGISTER.email,
    });

    const payment = await dataSource.getRepository(PaymentOrmEntity).save({
      amount: 20000,
      currency: 'eur',
      status: 'succeeded',
      provider: 'stripe',
      transactionId: 'pi_host_booking_test',
      userId: user!.id,
      propertyType: 'reservation',
      propertyId: 0,
    });

    const reservation = await dataSource
      .getRepository(ReservationOrmEntity)
      .save({
        userId: user!.id,
        status: RESERVATION_STATUS.CONFIRMED,
        payment,
        items: [
          {
            roomId,
            checkIn: '2026-11-01',
            checkOut: '2026-11-03',
            guestCount: 2,
            price: 200,
            nights: 2,
          },
        ],
      });

    await dataSource.getRepository(PaymentOrmEntity).update(payment.id, {
      propertyId: reservation.id,
    });

    const response = await request(app.getHttpServer())
      .get('/reservations/bookings/host')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.data.length).toBeGreaterThan(0);

    const booking = response.body.data.find(
      (item: { transactionId: string }) =>
        item.transactionId === 'pi_host_booking_test',
    );

    expect(booking).toEqual(
      expect.objectContaining({
        paymentId: payment.id,
        customerName: expect.any(String),
        previewLabel: expect.any(String),
        propertyId,
      }),
    );
  });
});
