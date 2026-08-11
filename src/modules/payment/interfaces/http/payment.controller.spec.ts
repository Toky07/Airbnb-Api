import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PaymentOrmEntity } from '@src/modules/payment/infrastructure/entities/payment.orm-entity';
import { PAYMENT_STATUS } from '@src/modules/payment/domain/constants/payment-status.constant';
import { ReservationOrmEntity } from '@src/modules/reservation/infrastructure/entities/reservation.orm-entity';
import { RESERVATION_STATUS } from '@src/modules/reservation/contracts';
import { PropertyEntity } from '@src/modules/properties/infrastructure/entities/property-entity.entity';
import { RoomEntity } from '@src/modules/rooms/infrastructure/entities/room.entity';
import { UserEntity } from '@src/modules/user/infrastructure/entities/user.entity';
import { setupE2eApp, type E2eAppContext } from '@src/test/e2e-app';

describe('PaymentController', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let roomId: number;
  let guestId: number;
  let webhookVerifier: E2eAppContext['webhookVerifier'];

  beforeAll(async () => {
    process.env.MAIL_TRANSPORT = 'console';
    process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_controller';
    const ctx = await setupE2eApp();
    app = ctx.app;
    dataSource = ctx.dataSource;
    webhookVerifier = ctx.webhookVerifier;

    const guest = await dataSource.getRepository(UserEntity).save({
      firstName: 'Guest',
      lastName: 'Pay',
      email: 'guest-pay@test.com',
      phoneNumber: '+33601020304',
      avatar: '',
      status: 'active',
    });
    guestId = guest.id;

    const host = await dataSource.getRepository(UserEntity).save({
      firstName: 'Host',
      lastName: 'Pay',
      email: 'host-pay@test.com',
      phoneNumber: '+33601020305',
      avatar: '',
      status: 'active',
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
      ownerId: host.id,
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
      property,
    });
    roomId = room.id;

    await dataSource.getRepository(PaymentOrmEntity).save({
      amount: 20000,
      currency: 'eur',
      status: 'pending',
      provider: 'stripe',
      transactionId: 'pi_test_123',
      userId: guest.id,
      propertyType: 'order',
      propertyId: 1,
    });
  });

  it('POST /payments/webhook met à jour le statut du paiement', async () => {
    const payment = await dataSource.getRepository(PaymentOrmEntity).findOne({
      where: {},
      order: { id: 'DESC' },
    });

    await dataSource.getRepository(PaymentOrmEntity).update(payment!.id, {
      status: 'pending',
    });

    await dataSource.getRepository(ReservationOrmEntity).save({
      userId: guestId,
      status: RESERVATION_STATUS.PENDING,
      payment: { id: payment!.id },
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

    webhookVerifier.verify = vi.fn().mockReturnValue({
      type: 'payment_intent.succeeded',
      paymentIntentId: payment!.transactionId,
      status: 'succeeded',
      errorMessage: null,
    });

    const response = await request(app.getHttpServer())
      .post('/payments/webhook')
      .set('stripe-signature', 'sig_test')
      .set('Content-Type', 'application/json')
      .send(Buffer.from('{"id":"evt_test"}'))
      .expect(201);

    expect(response.body.status).toBe(PAYMENT_STATUS.SUCCEEDED);
  });
});
