import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { vi } from 'vitest';
import { PropertyEntity } from '@src/modules/properties/infrastructure/entities/property-entity.entity';
import { RoomEntity } from '@src/modules/rooms/infrastructure/entities/room.entity';
import {
  CART_SESSION_HEADER,
  CART_ITEM_TYPE,
} from '@src/modules/cart/domain/constants/cart-item-type.constant';
import { PAYMENT_STATUS } from '@src/modules/payment/domain/constants/payment-status.constant';
import { PaymentOrmEntity } from '@src/modules/payment/infrastructure/entities/payment.orm-entity';
import { ReservationOrmEntity } from '@src/modules/reservation/infrastructure/entities/reservation.orm-entity';
import { RESERVATION_STATUS } from '@src/modules/reservation/contracts';
import {
  DEFAULT_REGISTER,
  enableHostStripeConnect,
  registerAndLoginAsHost,
  registerAndLoginAsSuperAdmin,
  registerAndLoginAsTraveler,
} from '@src/test/controller-test.helpers';
import { setupE2eApp, type E2eAppContext } from '@src/test/e2e-app';
import { UserEntity } from '@src/modules/user/infrastructure/entities/user.entity';

describe('CartController', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let token: string;
  let roomId: number;
  let ownerUserId: number;
  let paymentIntentCounter = 0;
  let paymentGateway: E2eAppContext['paymentGateway'];
  const sessionId = '11111111-1111-4111-8111-111111111111';

  beforeAll(async () => {
    process.env.MAIL_TRANSPORT = 'console';
    process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_cart';

    const ctx = await setupE2eApp();
    app = ctx.app;
    dataSource = ctx.dataSource;
    paymentGateway = ctx.paymentGateway;

    paymentGateway.createPaymentIntent = vi
      .fn()
      .mockImplementation(async () => {
        paymentIntentCounter += 1;
        return {
          id: `pi_cart_checkout_test_${paymentIntentCounter}`,
          clientSecret: `pi_cart_checkout_test_secret_${paymentIntentCounter}`,
          status: 'requires_payment_method',
        };
      });
    paymentGateway.retrievePaymentIntent = vi
      .fn()
      .mockImplementation(async (transactionId: string) => ({
        id: transactionId,
        status: 'succeeded',
      }));

    token = await registerAndLoginAsSuperAdmin(app, dataSource);

    const owner = await dataSource.getRepository(UserEntity).findOneByOrFail({
      email: DEFAULT_REGISTER.email,
    });
    ownerUserId = owner.id;
    await enableHostStripeConnect(dataSource, ownerUserId, 'acct_e2e_host');

    const property = await dataSource.getRepository(PropertyEntity).save({
      name: 'Hotel Panier',
      description: 'Description',
      address: '1 rue Test',
      city: 'Paris',
      country: 'France',
      latitude: 0,
      longitude: 0,
      checkInTime: '15:00',
      checkOutTime: '11:00',
      ownerId: ownerUserId,
    });

    const room = await dataSource.getRepository(RoomEntity).save({
      name: 'Suite Panier',
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
  });

  async function clearAuthenticatedCart(): Promise<void> {
    const cart = await request(app.getHttpServer())
      .get('/cart')
      .set('Authorization', `Bearer ${token}`)
      .set(CART_SESSION_HEADER, sessionId)
      .expect(200);

    for (const item of cart.body.items as { id: number }[]) {
      await request(app.getHttpServer())
        .delete(`/cart/items/${item.id}`)
        .set('Authorization', `Bearer ${token}`)
        .set(CART_SESSION_HEADER, sessionId)
        .expect(200);
    }
  }

  it('GET /cart crée un panier invité via x-cart-session', async () => {
    const response = await request(app.getHttpServer())
      .get('/cart')
      .set(CART_SESSION_HEADER, sessionId)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        sessionId,
        userId: null,
        items: [],
        totalPrice: 0,
        itemCount: 0,
      }),
    );
  });

  it('POST /cart/items ajoute une réservation au panier invité', async () => {
    const response = await request(app.getHttpServer())
      .post('/cart/items')
      .set(CART_SESSION_HEADER, sessionId)
      .send({
        itemType: CART_ITEM_TYPE.RESERVATION,
        roomId,
        startDate: '2026-11-01',
        endDate: '2026-11-03',
        guestCount: 2,
      })
      .expect(201);

    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0]).toEqual(
      expect.objectContaining({
        itemType: CART_ITEM_TYPE.RESERVATION,
        roomId,
        totalPrice: 200,
        nights: 2,
      }),
    );
  });

  it('POST /cart/items refuse un doublon de réservation', async () => {
    await request(app.getHttpServer())
      .post('/cart/items')
      .set(CART_SESSION_HEADER, sessionId)
      .send({
        itemType: CART_ITEM_TYPE.RESERVATION,
        roomId,
        startDate: '2026-11-01',
        endDate: '2026-11-03',
        guestCount: 2,
      })
      .expect(400);
  });

  it('POST /cart/merge rattache le panier invité au compte connecté', async () => {
    const response = await request(app.getHttpServer())
      .post('/cart/merge')
      .set('Authorization', `Bearer ${token}`)
      .set(CART_SESSION_HEADER, sessionId)
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        userId: expect.any(Number),
        items: expect.arrayContaining([
          expect.objectContaining({
            roomId,
            totalPrice: 200,
          }),
        ]),
      }),
    );
  });

  it('POST /cart/checkout déclenche le flux événementiel et retourne un payment intent', async () => {
    const response = await request(app.getHttpServer())
      .post('/cart/checkout')
      .set('Authorization', `Bearer ${token}`)
      .set(CART_SESSION_HEADER, sessionId)
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        paymentId: expect.any(Number),
        clientSecret: expect.stringContaining('pi_cart_checkout_test_secret_'),
        amount: 22000,
        currency: 'eur',
        publishableKey: 'pk_test_cart',
        holdUntil: expect.any(String),
        pricingBreakdown: expect.objectContaining({
          subtotalCents: 20000,
          vatCents: 2000,
          touristTaxCents: 0,
          serviceFeeCents: 0,
          totalCents: 22000,
        }),
      }),
    );

    const payment = await dataSource.getRepository(PaymentOrmEntity).findOne({
      where: { id: response.body.paymentId },
    });
    expect(payment?.cartId).toBeTruthy();
    expect(payment?.stripeAccountId).toBe('acct_e2e_host');
    expect(payment?.hostUserId).toBe(ownerUserId);
    expect(payment?.applicationFeeAmount).toBeGreaterThan(0);

    expect(paymentGateway.createPaymentIntent).toHaveBeenCalledWith(
      expect.objectContaining({
        transferDestination: 'acct_e2e_host',
        applicationFeeAmount: expect.any(Number),
      }),
    );

    const reservation = await dataSource
      .getRepository(ReservationOrmEntity)
      .findOne({
        where: { id: payment!.propertyId },
        relations: ['items'],
      });
    expect(reservation?.status).toBe(RESERVATION_STATUS.PENDING);
    expect(reservation?.holdUntil).toBeTruthy();
    expect(reservation?.items).toHaveLength(1);
  });

  it('POST /cart/checkout refuse un second hold qui chevauche les mêmes dates', async () => {
    await clearAuthenticatedCart();

    await request(app.getHttpServer())
      .post('/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .set(CART_SESSION_HEADER, sessionId)
      .send({
        itemType: CART_ITEM_TYPE.RESERVATION,
        roomId,
        startDate: '2026-11-10',
        endDate: '2026-11-12',
        guestCount: 2,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/cart/checkout')
      .set('Authorization', `Bearer ${token}`)
      .set(CART_SESSION_HEADER, sessionId)
      .expect(201);

    const secondToken = await registerAndLoginAsHost(app, dataSource, {
      email: `cart-overlap-${Date.now()}@test.com`,
      password: '123456',
      firstName: 'Other',
      lastName: 'Guest',
      phoneNumber: '+33601020999',
    });
    const secondSession = '22222222-2222-4222-8222-222222222222';

    await request(app.getHttpServer())
      .post('/cart/items')
      .set('Authorization', `Bearer ${secondToken}`)
      .set(CART_SESSION_HEADER, secondSession)
      .send({
        itemType: CART_ITEM_TYPE.RESERVATION,
        roomId,
        startDate: '2026-11-10',
        endDate: '2026-11-12',
        guestCount: 2,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/cart/checkout')
      .set('Authorization', `Bearer ${secondToken}`)
      .set(CART_SESSION_HEADER, secondSession)
      .expect(400);
  });

  it('POST /cart/checkout/complete vide le panier après vérification du paiement', async () => {
    await clearAuthenticatedCart();

    await request(app.getHttpServer())
      .post('/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .set(CART_SESSION_HEADER, sessionId)
      .send({
        itemType: CART_ITEM_TYPE.RESERVATION,
        roomId,
        startDate: '2026-12-01',
        endDate: '2026-12-03',
        guestCount: 2,
      })
      .expect(201);

    const checkout = await request(app.getHttpServer())
      .post('/cart/checkout')
      .set('Authorization', `Bearer ${token}`)
      .set(CART_SESSION_HEADER, sessionId)
      .expect(201);

    const complete = await request(app.getHttpServer())
      .post('/cart/checkout/complete')
      .set('Authorization', `Bearer ${token}`)
      .set(CART_SESSION_HEADER, sessionId)
      .send({ paymentId: checkout.body.paymentId })
      .expect(201);

    expect(complete.body.items).toEqual([]);

    const payment = await dataSource.getRepository(PaymentOrmEntity).findOne({
      where: { id: checkout.body.paymentId },
    });
    expect(payment?.status).toBe(PAYMENT_STATUS.SUCCEEDED);
  });

  it('POST /cart/checkout/complete refuses a payment owned by another user', async () => {
    await clearAuthenticatedCart();

    await request(app.getHttpServer())
      .post('/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .set(CART_SESSION_HEADER, sessionId)
      .send({
        itemType: CART_ITEM_TYPE.RESERVATION,
        roomId,
        startDate: '2027-02-01',
        endDate: '2027-02-03',
        guestCount: 2,
      })
      .expect(201);

    const checkout = await request(app.getHttpServer())
      .post('/cart/checkout')
      .set('Authorization', `Bearer ${token}`)
      .set(CART_SESSION_HEADER, sessionId)
      .expect(201);

    const attackerToken = await registerAndLoginAsTraveler(app, dataSource, {
      email: `cart-idor-${Date.now()}@test.com`,
      password: '123456',
      firstName: 'Attacker',
      lastName: 'User',
      phoneNumber: '+33601020997',
    });

    await request(app.getHttpServer())
      .post('/cart/checkout/complete')
      .set('Authorization', `Bearer ${attackerToken}`)
      .send({ paymentId: checkout.body.paymentId })
      .expect(403);

    const ownerCart = await request(app.getHttpServer())
      .get('/cart')
      .set('Authorization', `Bearer ${token}`)
      .set(CART_SESSION_HEADER, sessionId)
      .expect(200);

    expect(ownerCart.body.items.length).toBeGreaterThan(0);
  });

  it('POST /cart/checkout refuse un panier multi-hôtes', async () => {
    await clearAuthenticatedCart();

    const otherEmail = `cart-multi-host-${Date.now()}@test.com`;
    await registerAndLoginAsHost(app, dataSource, {
      email: otherEmail,
      password: '123456',
      firstName: 'Other',
      lastName: 'Host',
      phoneNumber: '+33601020991',
    });
    const otherHost = await dataSource
      .getRepository(UserEntity)
      .findOneByOrFail({ email: otherEmail });
    await enableHostStripeConnect(
      dataSource,
      otherHost.id,
      'acct_e2e_other_host',
    );

    const otherProperty = await dataSource.getRepository(PropertyEntity).save({
      name: 'Hotel Autre Hôte',
      description: 'Description',
      address: '2 rue Test',
      city: 'Lyon',
      country: 'France',
      latitude: 0,
      longitude: 0,
      checkInTime: '15:00',
      checkOutTime: '11:00',
      ownerId: otherHost.id,
    });
    const otherRoom = await dataSource.getRepository(RoomEntity).save({
      name: 'Chambre Autre',
      description: 'Chambre',
      pricePerNight: 80,
      maxGuests: 2,
      bedrooms: 1,
      bathrooms: 1,
      beds: 1,
      quantity: 1,
      size: 20,
      status: 'available',
      property: otherProperty,
    });

    await request(app.getHttpServer())
      .post('/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .set(CART_SESSION_HEADER, sessionId)
      .send({
        itemType: CART_ITEM_TYPE.RESERVATION,
        roomId,
        startDate: '2027-03-01',
        endDate: '2027-03-03',
        guestCount: 2,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .set(CART_SESSION_HEADER, sessionId)
      .send({
        itemType: CART_ITEM_TYPE.RESERVATION,
        roomId: otherRoom.id,
        startDate: '2027-04-01',
        endDate: '2027-04-03',
        guestCount: 2,
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/cart/checkout')
      .set('Authorization', `Bearer ${token}`)
      .set(CART_SESSION_HEADER, sessionId)
      .expect(400);

    expect(response.body.message).toMatch(/plusieurs hôtes/i);
  });

  it('POST /cart/checkout refuse un hôte non onboardé', async () => {
    await clearAuthenticatedCart();

    const hostEmail = `cart-no-stripe-${Date.now()}@test.com`;
    await registerAndLoginAsHost(app, dataSource, {
      email: hostEmail,
      password: '123456',
      firstName: 'Sans',
      lastName: 'Stripe',
      phoneNumber: '+33601020992',
    });
    const host = await dataSource
      .getRepository(UserEntity)
      .findOneByOrFail({ email: hostEmail });

    const property = await dataSource.getRepository(PropertyEntity).save({
      name: 'Hotel Sans Paiement',
      description: 'Description',
      address: '3 rue Test',
      city: 'Nice',
      country: 'France',
      latitude: 0,
      longitude: 0,
      checkInTime: '15:00',
      checkOutTime: '11:00',
      ownerId: host.id,
    });
    const unonboardedRoom = await dataSource.getRepository(RoomEntity).save({
      name: 'Chambre Sans Stripe',
      description: 'Chambre',
      pricePerNight: 90,
      maxGuests: 2,
      bedrooms: 1,
      bathrooms: 1,
      beds: 1,
      quantity: 1,
      size: 22,
      status: 'available',
      property,
    });

    await request(app.getHttpServer())
      .post('/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .set(CART_SESSION_HEADER, sessionId)
      .send({
        itemType: CART_ITEM_TYPE.RESERVATION,
        roomId: unonboardedRoom.id,
        startDate: '2027-05-01',
        endDate: '2027-05-03',
        guestCount: 2,
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/cart/checkout')
      .set('Authorization', `Bearer ${token}`)
      .set(CART_SESSION_HEADER, sessionId)
      .expect(400);

    expect(response.body.message).toMatch(/activé les paiements Stripe/i);
  });

  it('DELETE /cart/items/:id supprime un article', async () => {
    await clearAuthenticatedCart();

    const add = await request(app.getHttpServer())
      .post('/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({
        itemType: CART_ITEM_TYPE.RESERVATION,
        roomId,
        startDate: '2027-01-10',
        endDate: '2027-01-12',
        guestCount: 2,
      })
      .expect(201);

    const itemId = add.body.items[0].id as number;

    const response = await request(app.getHttpServer())
      .delete(`/cart/items/${itemId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.items).toEqual([]);
  });
});
