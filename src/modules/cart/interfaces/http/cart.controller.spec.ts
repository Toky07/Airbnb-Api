import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { vi } from 'vitest';
import { AuthModule } from '../../../authentication/auth.module';
import { UserModule } from '../../../user/user.module';
import { PropertiesModule } from '../../../properties/properties.module';
import { RoomsModule } from '../../../rooms/room.module';
import { ReservationModule } from '../../../reservation/reservation.module';
import { PaymentModule } from '../../../payment/payment.module';
import { CartModule } from '../../cart.module';
import { PropertyEntity } from '../../../properties/infrastructure/entities/property-entity.entity';
import { RoomEntity } from '../../../rooms/infrastructure/entities/room.entity';
import {
  CART_SESSION_HEADER,
  CART_ITEM_TYPE,
} from '../../domain/constants/cart-item-type.constant';
import { PAYMENT_GATEWAY } from '../../../payment/domain/ports/payment-gateway.port';
import { PAYMENT_STATUS } from '../../../payment/domain/constants/payment-status.constant';
import { PaymentOrmEntity } from '../../../payment/infrastructure/entities/payment.orm-entity';
import { ReservationOrmEntity } from '../../../reservation/infrastructure/entities/reservation.orm-entity';
import { RESERVATION_STATUS } from '../../../reservation/domain/constants/reservation-status.constant';
import { createPaymentGatewayMock } from '../../../payment/applications/useCase/payment-test.helpers';
import {
  AUTH_TEST_ENTITIES,
  DOMAIN_TEST_ENTITIES,
  registerAndLoginAsSuperAdmin,
} from '../../../../test/controller-test.helpers';
import {
  getIntegrationTestDatabaseConfig,
  prepareIntegrationTestDatabase,
} from '../../../../test/test-database.config';

describe('CartController', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let token: string;
  let roomId: number;
  let paymentIntentCounter = 0;
  let paymentGateway = createPaymentGatewayMock();
  const sessionId = 'guest-cart-session-e2e';

  beforeAll(async () => {
    process.env.MAIL_TRANSPORT = 'console';
    process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_cart';

    paymentGateway = createPaymentGatewayMock({
      createPaymentIntent: vi.fn().mockImplementation(async () => {
        paymentIntentCounter += 1;
        return {
          id: `pi_cart_checkout_test_${paymentIntentCounter}`,
          clientSecret: `pi_cart_checkout_test_secret_${paymentIntentCounter}`,
          status: 'requires_payment_method',
        };
      }),
      retrievePaymentIntent: vi
        .fn()
        .mockImplementation(async (transactionId: string) => ({
          id: transactionId,
          status: 'succeeded',
        })),
    });

    await prepareIntegrationTestDatabase();

    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(
          getIntegrationTestDatabaseConfig([
            ...AUTH_TEST_ENTITIES,
            ...DOMAIN_TEST_ENTITIES,
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
        PaymentModule,
        CartModule,
      ],
    })
      .overrideProvider(PAYMENT_GATEWAY)
      .useValue(paymentGateway)
      .compile();

    dataSource = moduleRef.get(DataSource);
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    token = await registerAndLoginAsSuperAdmin(app, dataSource);

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
      ownerId: 1,
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
      propertyId: property.id,
    });

    roomId = room.id;
  });

  afterAll(async () => {
    await app?.close();
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
        amount: 20000,
        currency: 'eur',
        publishableKey: 'pk_test_cart',
      }),
    );

    const payment = await dataSource.getRepository(PaymentOrmEntity).findOne({
      where: { id: response.body.paymentId },
    });
    expect(payment?.cartId).toBeTruthy();

    const reservation = await dataSource
      .getRepository(ReservationOrmEntity)
      .findOne({
        where: { id: payment!.propertyId },
        relations: ['items'],
      });
    expect(reservation?.status).toBe(RESERVATION_STATUS.PENDING);
    expect(reservation?.items).toHaveLength(1);
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
