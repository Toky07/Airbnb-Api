import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PropertyEntity } from '@src/modules/properties/infrastructure/entities/property-entity.entity';
import { RoomEntity } from '@src/modules/rooms/infrastructure/entities/room.entity';
import { UserEntity } from '@src/modules/user/infrastructure/entities/user.entity';
import { ReservationOrmEntity } from '@src/modules/reservation/infrastructure/entities/reservation.orm-entity';
import { ReservationItemOrmEntity } from '@src/modules/reservation/infrastructure/entities/reservation-item.orm-entity';
import { ReviewOrmEntity } from '@src/modules/review/infrastructure/entities/review.orm-entity';
import { REVIEW_STATUS } from '@src/modules/review/domain/constants/review-status.constant';
import { RESERVATION_STATUS } from '@src/modules/reservation/contracts';
import {
  DEFAULT_REGISTER,
  registerAndLoginAsSuperAdmin,
} from '@src/test/controller-test.helpers';
import { setupE2eApp } from '@src/test/e2e-app';

describe('ReviewController', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let token: string;
  let userId: number;
  let reservationId: number;
  let roomSlug: string;

  beforeAll(async () => {
    process.env.MAIL_TRANSPORT = 'console';
    const ctx = await setupE2eApp();
    app = ctx.app;
    dataSource = ctx.dataSource;

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

    const reservation = await dataSource
      .getRepository(ReservationOrmEntity)
      .save({
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
