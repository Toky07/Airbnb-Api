import request from 'supertest';
import { Test, type TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { AuthModule } from '../../../authentication/auth.module';
import { UserModule } from '../../../user/user.module';
import { PropertiesModule } from '../../../properties/properties.module';
import { RoomsModule } from '../../../rooms/room.module';
import { ReservationModule } from '../../../reservation/reservation.module';
import { ReviewModule } from '../../review.module';
import { PropertyEntity } from '../../../properties/infrastructure/entities/property-entity.entity';
import { RoomEntity } from '../../../rooms/infrastructure/entities/room.entity';
import { UserEntity } from '../../../user/infrastructure/entities/user.entity';
import { ReservationOrmEntity } from '../../../reservation/infrastructure/entities/reservation.orm-entity';
import { ReservationItemOrmEntity } from '../../../reservation/infrastructure/entities/reservation-item.orm-entity';
import { ReviewOrmEntity } from '../../infrastructure/entities/review.orm-entity';
import { REVIEW_STATUS } from '../../domain/constants/review-status.constant';
import { RESERVATION_STATUS } from '../../../reservation/domain/constants/reservation-status.constant';
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

describe('ReviewController', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let token: string;
  let userId: number;
  let reservationId: number;
  let roomSlug: string;

  beforeAll(async () => {
    process.env.MAIL_TRANSPORT = 'console';
    await prepareIntegrationTestDatabase();

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(
          getIntegrationTestDatabaseConfig([
            ...AUTH_TEST_ENTITIES,
            ...DOMAIN_TEST_ENTITIES,
            ReviewOrmEntity,
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
        ReviewModule,
      ],
    }).compile();

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
    userId = user!.id;

    const property = await dataSource.getRepository(PropertyEntity).save({
      name: 'Hotel Avis',
      description: 'Description',
      address: '1 rue Test',
      city: 'Paris',
      country: 'France',
      latitude: 0,
      longitude: 0,
      checkInTime: '15:00',
      checkOutTime: '11:00',
      ownerId: userId,
    });

    const room = await dataSource.getRepository(RoomEntity).save({
      name: 'Suite Avis',
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
      slug: 'suite-avis',
    });
    roomSlug = room.slug;

    const reservation = await dataSource.getRepository(ReservationOrmEntity).save({
      userId,
      status: RESERVATION_STATUS.CONFIRMED,
      holdUntil: null,
    });

    await dataSource.getRepository(ReservationItemOrmEntity).save({
      reservation: { id: reservation.id },
      roomId: room.id,
      checkIn: '2020-01-01',
      checkOut: '2020-01-05',
      guestCount: 2,
      price: 400,
      nights: 4,
    });

    reservationId = reservation.id;
  });

  afterAll(async () => {
    await app?.close();
  });

  it('POST /reviews crée un avis en attente', async () => {
    const response = await request(app.getHttpServer())
      .post('/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({
        reservationId,
        rating: 5,
        comment: 'Excellent séjour, je recommande.',
      })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        reservationId,
        rating: 5,
        comment: 'Excellent séjour, je recommande.',
        status: REVIEW_STATUS.PENDING,
      }),
    );
  });

  it('GET /reviews/me liste les avis de l’utilisateur', async () => {
    const response = await request(app.getHttpServer())
      .get('/reviews/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          reservationId,
          rating: 5,
        }),
      ]),
    );
  });

  it('GET /reviews liste les avis en attente pour modération', async () => {
    const response = await request(app.getHttpServer())
      .get('/reviews')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0].status).toBe(REVIEW_STATUS.PENDING);
  });

  it('PATCH /reviews/:id/moderate publie un avis', async () => {
    const pending = await dataSource.getRepository(ReviewOrmEntity).findOneBy({
      reservationId,
    });

    const response = await request(app.getHttpServer())
      .patch(`/reviews/${pending!.id}/moderate`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: REVIEW_STATUS.PUBLISHED })
      .expect(200);

    expect(response.body.status).toBe(REVIEW_STATUS.PUBLISHED);
  });

  it('GET /rooms/by-slug/:slug/reviews retourne les avis publiés', async () => {
    const response = await request(app.getHttpServer())
      .get(`/rooms/by-slug/${roomSlug}/reviews`)
      .expect(200);

    expect(response.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          rating: 5,
          status: REVIEW_STATUS.PUBLISHED,
        }),
      ]),
    );
  });

  it('GET /rooms/by-slug/:slug/rating-summary retourne le résumé', async () => {
    const response = await request(app.getHttpServer())
      .get(`/rooms/by-slug/${roomSlug}/rating-summary`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        averageRating: 5,
        totalReviews: 1,
      }),
    );
  });

  it('refuse les requêtes non authentifiées sur POST /reviews', async () => {
    await request(app.getHttpServer())
      .post('/reviews')
      .send({
        reservationId,
        rating: 4,
        comment: 'Test',
      })
      .expect(401);
  });
});
