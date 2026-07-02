import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { PaymentModule } from '../../payment.module';
import { PaymentOrmEntity } from '../../infrastructure/entities/payment.orm-entity';
import { PAYMENT_GATEWAY } from '../../domain/ports/payment-gateway.port';
import { PAYMENT_STATUS } from '../../domain/constants/payment-status.constant';
import {
  AUTH_TEST_ENTITIES,
  DOMAIN_TEST_ENTITIES,
} from '../../../../test/controller-test.helpers';
import {
  createPaymentGatewayMock,
  createWebhookVerifierMock,
} from '../../applications/useCase/payment-test.helpers';
import { StripeWebhookVerifier } from '../../infrastructure/stripe/StripeWebhookVerifier';
import { ReservationOrmEntity } from '../../../reservation/infrastructure/entities/reservation.orm-entity';
import { RESERVATION_STATUS } from '../../../reservation/domain/constants/reservation-status.constant';
import { PropertyEntity } from '../../../properties/infrastructure/entities/property-entity.entity';
import { RoomEntity } from '../../../rooms/infrastructure/entities/room.entity';

describe('PaymentController', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let roomId: number;
  const paymentGateway = createPaymentGatewayMock();
  const webhookVerifier = createWebhookVerifierMock();

  beforeAll(async () => {
    process.env.MAIL_TRANSPORT = 'console';
    process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_controller';

    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [
            ...AUTH_TEST_ENTITIES,
            ...DOMAIN_TEST_ENTITIES,
            ReservationOrmEntity,
            PaymentOrmEntity,
          ],
          synchronize: true,
        }),
        JwtModule.register({
          global: true,
          secret: '1234',
          signOptions: { expiresIn: '5h' },
        }),
        PaymentModule,
      ],
    })
      .overrideProvider(PAYMENT_GATEWAY)
      .useValue(paymentGateway)
      .overrideProvider(StripeWebhookVerifier)
      .useValue(webhookVerifier)
      .compile();

    dataSource = moduleRef.get(DataSource);
    app = moduleRef.createNestApplication({ rawBody: true });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

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

    await dataSource.getRepository(PaymentOrmEntity).save({
      amount: 20000,
      currency: 'eur',
      status: 'pending',
      provider: 'stripe',
      transactionId: 'pi_test_123',
      userId: 1,
      propertyType: 'order',
      propertyId: 1,
    });
  });

  afterAll(async () => {
    await app?.close();
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
      userId: 1,
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
