import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PropertyEntity } from '@src/modules/properties/infrastructure/entities/property-entity.entity';
import { RoomEntity } from '@src/modules/rooms/infrastructure/entities/room.entity';
import { UserEntity } from '@src/modules/user/infrastructure/entities/user.entity';
import { ReservationOrmEntity } from '@src/modules/reservation/infrastructure/entities/reservation.orm-entity';
import { ReservationItemOrmEntity } from '@src/modules/reservation/infrastructure/entities/reservation-item.orm-entity';
import { RESERVATION_STATUS } from '@src/modules/reservation/contracts';
import {
  DEFAULT_REGISTER,
  registerAndLoginAsHost,
  registerAndLoginAsSuperAdmin,
} from '@src/test/controller-test.helpers';
import { setupE2eApp } from '@src/test/e2e-app';

describe('MessagingController', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let guestToken: string;
  let hostToken: string;
  let guestUserId: number;
  let hostUserId: number;
  let reservationId: number;

  beforeAll(async () => {
    process.env.MAIL_TRANSPORT = 'console';
    const ctx = await setupE2eApp();
    app = ctx.app;
    dataSource = ctx.dataSource;

    guestToken = await registerAndLoginAsSuperAdmin(app, dataSource);
    hostToken = await registerAndLoginAsHost(app, dataSource, {
      email: 'host-messaging@test.com',
      password: '123456',
      firstName: 'Host',
      lastName: 'Messaging',
      phoneNumber: '+33601020305',
    });

    const guestUser = await dataSource.getRepository(UserEntity).findOneBy({
      email: DEFAULT_REGISTER.email,
    });
    const hostUser = await dataSource.getRepository(UserEntity).findOneBy({
      email: 'host-messaging@test.com',
    });

    guestUserId = guestUser!.id;
    hostUserId = hostUser!.id;

    const property = await dataSource.getRepository(PropertyEntity).save({
      name: 'Hotel Messaging',
      description: 'Description',
      address: '1 rue Test',
      city: 'Paris',
      country: 'France',
      latitude: 0,
      longitude: 0,
      checkInTime: '15:00',
      checkOutTime: '11:00',
      ownerId: hostUserId,
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
      property: { id: property.id },
    });

    const reservation = await dataSource
      .getRepository(ReservationOrmEntity)
      .save({
        userId: guestUserId,
        status: RESERVATION_STATUS.CONFIRMED,
        holdUntil: null,
      });

    await dataSource.getRepository(ReservationItemOrmEntity).save({
      reservation: { id: reservation.id },
      roomId: room.id,
      checkIn: '2026-09-01',
      checkOut: '2026-09-03',
      guestCount: 2,
      price: 200,
      nights: 2,
    });

    reservationId = reservation.id;
  });

  it('POST /conversations/from-reservation/:reservationId creates a conversation', async () => {
    const response = await request(app.getHttpServer())
      .post(`/conversations/from-reservation/${reservationId}`)
      .set('Authorization', `Bearer ${guestToken}`)
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        guestId: guestUserId,
        hostId: hostUserId,
        reservationId,
      }),
    );
  });

  it('POST /conversations/:id/messages sends a message', async () => {
    const conversation = await request(app.getHttpServer())
      .post(`/conversations/from-reservation/${reservationId}`)
      .set('Authorization', `Bearer ${guestToken}`)
      .expect(201);

    const response = await request(app.getHttpServer())
      .post(`/conversations/${conversation.body.id}/messages`)
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ body: 'Bonjour, une question sur mon séjour.' })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        conversationId: conversation.body.id,
        senderId: guestUserId,
        body: 'Bonjour, une question sur mon séjour.',
      }),
    );
  });

  it('GET /conversations/me lists conversations for guest and host', async () => {
    const guestResponse = await request(app.getHttpServer())
      .get('/conversations/me')
      .set('Authorization', `Bearer ${guestToken}`)
      .expect(200);

    expect(guestResponse.body.length).toBeGreaterThan(0);

    const hostResponse = await request(app.getHttpServer())
      .get('/conversations/me')
      .set('Authorization', `Bearer ${hostToken}`)
      .expect(200);

    expect(hostResponse.body.length).toBeGreaterThan(0);
  });

  it('GET /conversations/:id/messages returns messages', async () => {
    const conversation = await request(app.getHttpServer())
      .post(`/conversations/from-reservation/${reservationId}`)
      .set('Authorization', `Bearer ${guestToken}`)
      .expect(201);

    await request(app.getHttpServer())
      .post(`/conversations/${conversation.body.id}/messages`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ body: 'Bonjour, comment puis-je vous aider ?' })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get(`/conversations/${conversation.body.id}/messages`)
      .set('Authorization', `Bearer ${guestToken}`)
      .expect(200);

    expect(response.body.length).toBeGreaterThanOrEqual(2);
  });

  it('rejects access from unrelated users', async () => {
    const unrelatedToken = await registerAndLoginAsHost(app, dataSource, {
      email: 'other-host@test.com',
      password: '123456',
      firstName: 'Other',
      lastName: 'Host',
      phoneNumber: '+33601020306',
    });

    const conversation = await request(app.getHttpServer())
      .post(`/conversations/from-reservation/${reservationId}`)
      .set('Authorization', `Bearer ${guestToken}`)
      .expect(201);

    await request(app.getHttpServer())
      .post(`/conversations/from-reservation/${reservationId}`)
      .set('Authorization', `Bearer ${unrelatedToken}`)
      .expect(403);

    await request(app.getHttpServer())
      .get(`/conversations/${conversation.body.id}/messages`)
      .set('Authorization', `Bearer ${unrelatedToken}`)
      .expect(403);
  });
});
