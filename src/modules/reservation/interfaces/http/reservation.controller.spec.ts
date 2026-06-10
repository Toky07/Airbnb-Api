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
import { ReservationOrmEntity } from '../../infrastructure/entities/reservation.orm-entity';
import { PropertyEntity } from '../../../properties/infrastructure/entities/property-entity.entity';
import { RoomEntity } from '../../../rooms/infrastructure/entities/room.entity';
import { RESERVATION_STATUS } from '../../domain/constants/reservation-status.constant';
import {
  AUTH_TEST_ENTITIES,
  DOMAIN_TEST_ENTITIES,
  registerAndLoginAsSuperAdmin,
} from '../../../../test/controller-test.helpers';

describe('ReservationController', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let token: string;
  let roomId: number;

  beforeAll(async () => {
    process.env.MAIL_TRANSPORT = 'console';

    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [
            ...AUTH_TEST_ENTITIES,
            ...DOMAIN_TEST_ENTITIES,
            ReservationOrmEntity,
          ],
          synchronize: true,
        }),
        JwtModule.register({
          global: true,
          secret: '1234',
          secretOrPrivateKey: '1234',
          signOptions: { expiresIn: '5h' },
        }),
        AuthModule,
        UserModule,
        PropertiesModule,
        RoomsModule,
        ReservationModule,
      ],
    }).compile();

    dataSource = moduleRef.get(DataSource);
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    token = await registerAndLoginAsSuperAdmin(app, dataSource);

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
      ownerId: 1,
    });

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
      propertyId: property.id,
    });

    roomId = room.id;
  });

  afterAll(async () => {
    await app?.close();
  });

  it('POST /reservations crée une réservation', async () => {
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
        roomId,
        status: RESERVATION_STATUS.PENDING,
        totalPrice: 200,
        nights: 2,
      }),
    );
  });

  it('GET /reservations retourne la liste admin', async () => {
    const response = await request(app.getHttpServer())
      .get('/reservations')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it('GET /reservations/me retourne les réservations de l’utilisateur', async () => {
    const response = await request(app.getHttpServer())
      .get('/reservations/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it('POST /reservations/:id/cancel annule une réservation', async () => {
    const reservation = await dataSource.getRepository(ReservationOrmEntity).findOne({
      where: {},
      order: { id: 'DESC' },
    });

    const response = await request(app.getHttpServer())
      .post(`/reservations/${reservation!.id}/cancel`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    expect(response.body.status).toBe(RESERVATION_STATUS.CANCELLED);
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
});
