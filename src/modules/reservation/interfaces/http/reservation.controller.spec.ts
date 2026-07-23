import request from 'supertest';
import { Test, type TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { vi } from 'vitest';
import { AuthModule } from '../../../authentication/auth.module';
import { UserModule } from '../../../user/user.module';
import { RoomsModule } from '../../../rooms/room.module';
import { PropertiesModule } from '../../../properties/properties.module';
import { ReservationModule } from '../../reservation.module';
import { PaymentModule } from '../../../payment/payment.module';
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
import {
  createPaymentGatewayMock,
  createWebhookVerifierMock,
} from '../../../payment/applications/useCase/payment-test.helpers';
import { StripeWebhookVerifier } from '../../../payment/infrastructure/stripe/StripeWebhookVerifier';
import { UserEntity } from '../../../user/infrastructure/entities/user.entity';
import {
  RESERVATION_REPOSITORY,
  type IReservationRepository,
} from '../../domain/repositories/reservation.repository';

describe('ReservationController', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let moduleRef: TestingModule;
  let reservationRepository: IReservationRepository;
  let token: string;
  let roomId: number;
  let propertyId: number;
  const webhookVerifier = createWebhookVerifierMock();

  beforeAll(async () => {
    process.env.MAIL_TRANSPORT = 'console';
    process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_reservation';
    await prepareIntegrationTestDatabase();

    moduleRef = await Test.createTestingModule({
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
        PaymentModule,
        ReservationModule,
      ],
    })
      .overrideProvider(PAYMENT_GATEWAY)
      .useValue(createPaymentGatewayMock())
      .overrideProvider(StripeWebhookVerifier)
      .useValue(webhookVerifier)
      .compile();

    dataSource = moduleRef.get(DataSource);
    reservationRepository = moduleRef.get(RESERVATION_REPOSITORY);
    app = moduleRef.createNestApplication({ rawBody: true });
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
        holdUntil: expect.any(String),
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

    const reservation = await dataSource
      .getRepository(ReservationOrmEntity)
      .findOne({ where: { id: response.body.id } });
    expect(reservation?.holdUntil).toBeTruthy();
    expect(reservation!.holdUntil!.getTime()).toBeGreaterThan(Date.now());
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

    expect(response.body.reservation).toEqual(
      expect.objectContaining({
        status: RESERVATION_STATUS.CANCELLED,
      }),
    );
  });

  it('POST /payments/webhook annule une réservation dont le hold a expiré', async () => {
    const payment = await dataSource.getRepository(PaymentOrmEntity).save({
      amount: 20000,
      currency: 'eur',
      status: 'pending',
      provider: 'stripe',
      transactionId: 'pi_hold_expired_test',
      userId: 1,
      propertyType: 'reservation',
      propertyId: 0,
    });

    const reservation = await dataSource
      .getRepository(ReservationOrmEntity)
      .save({
        userId: 1,
        status: RESERVATION_STATUS.PENDING,
        holdUntil: new Date(Date.now() - 60_000),
        payment,
        items: [
          {
            roomId,
            checkIn: '2027-02-01',
            checkOut: '2027-02-03',
            guestCount: 2,
            price: 200,
            nights: 2,
          },
        ],
      });

    webhookVerifier.verify = vi.fn().mockReturnValue({
      type: 'payment_intent.succeeded',
      paymentIntentId: payment.transactionId,
      status: 'succeeded',
      errorMessage: null,
    });

    await request(app.getHttpServer())
      .post('/payments/webhook')
      .set('stripe-signature', 'sig_hold_expired')
      .set('Content-Type', 'application/json')
      .send(Buffer.from('{"id":"evt_hold_expired"}'))
      .expect(400);

    const updated = await dataSource
      .getRepository(ReservationOrmEntity)
      .findOne({ where: { id: reservation.id } });
    expect(updated?.status).toBe(RESERVATION_STATUS.CANCELLED);
    expect(updated?.holdUntil).toBeNull();
  });

  it('clearExpiredReservations supprime les pending expirés et conserve les holds valides', async () => {
    const expired = await dataSource.getRepository(ReservationOrmEntity).save({
      userId: 1,
      status: RESERVATION_STATUS.PENDING,
      holdUntil: new Date(Date.now() - 60_000),
      items: [
        {
          roomId,
          checkIn: '2027-03-01',
          checkOut: '2027-03-03',
          guestCount: 2,
          price: 200,
          nights: 2,
        },
      ],
    });

    const active = await dataSource.getRepository(ReservationOrmEntity).save({
      userId: 1,
      status: RESERVATION_STATUS.PENDING,
      holdUntil: new Date(Date.now() + 60 * 60 * 1000),
      items: [
        {
          roomId,
          checkIn: '2027-04-01',
          checkOut: '2027-04-03',
          guestCount: 2,
          price: 200,
          nights: 2,
        },
      ],
    });

    await reservationRepository.clearExpiredReservations();

    expect(await reservationRepository.findById(expired.id)).toBeNull();
    expect(await reservationRepository.findById(active.id)).not.toBeNull();
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
        reservationId: reservation.id,
        reservationStatus: RESERVATION_STATUS.CONFIRMED,
      }),
    );
  });

  it('GET /reservations/:id/cancellation-preview estime le remboursement', async () => {
    const payment = await dataSource.getRepository(PaymentOrmEntity).save({
      amount: 20000,
      currency: 'eur',
      status: 'succeeded',
      provider: 'stripe',
      transactionId: 'pi_preview_test',
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

    await dataSource.getRepository(PaymentOrmEntity).update(payment.id, {
      propertyId: reservation.id,
    });

    const response = await request(app.getHttpServer())
      .get(`/reservations/${reservation.id}/cancellation-preview`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        reservationId: reservation.id,
        refundPercent: expect.any(Number),
        policyLabel: expect.any(String),
        cancellationPolicy: 'moderate',
      }),
    );
  });
});
