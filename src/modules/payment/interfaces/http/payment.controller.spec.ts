import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { AuthModule } from '../../../authentication/auth.module';
import { UserModule } from '../../../user/user.module';
import { RoomsModule } from '../../../rooms/room.module';
import { PaymentModule } from '../../payment.module';
import { PaymentOrmEntity } from '../../infrastructure/entities/payment.orm-entity';
import { PropertyEntity } from '../../../properties/infrastructure/entities/property-entity.entity';
import { RoomEntity } from '../../../rooms/infrastructure/entities/room.entity';
import { PAYMENT_GATEWAY } from '../../domain/ports/payment-gateway.port';
import { PAYMENT_STATUS } from '../../domain/constants/payment-status.constant';
import {
  AUTH_TEST_ENTITIES,
  DOMAIN_TEST_ENTITIES,
  registerAndLoginAsSuperAdmin,
} from '../../../../test/controller-test.helpers';
import { createPaymentGatewayMock } from '../../applications/useCase/payment-test.helpers';
import { RESERVATION_STATUS } from '../../../reservation/domain/constants/reservation-status.constant';
import { ReservationOrmEntity } from '../../../reservation/infrastructure/entities/reservation.orm-entity';

describe('PaymentController', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let token: string;
  let roomId: number;
  let paymentGateway = createPaymentGatewayMock();

  beforeAll(async () => {
    process.env.MAIL_TRANSPORT = 'console';
    process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_controller';

    paymentGateway = createPaymentGatewayMock();

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
        AuthModule,
        UserModule,
        RoomsModule,
        PaymentModule,
      ],
    })
      .overrideProvider(PAYMENT_GATEWAY)
      .useValue(paymentGateway)
      .compile();

    dataSource = moduleRef.get(DataSource);
    app = moduleRef.createNestApplication({ rawBody: true });
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
    await app.close();
  });

  it('GET /payments retourne la liste paginée pour un admin', async () => {
    const existing = await dataSource.getRepository(PaymentOrmEntity).findOne({
      where: {},
      order: { id: 'DESC' },
    });
    await dataSource.getRepository(PaymentOrmEntity).update(existing!.id, {
      status: 'succeeded',
    });

    const response = await request(app.getHttpServer())
      .get('/payments')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.meta).toEqual(
      expect.objectContaining({
        page: 1,
        total: expect.any(Number),
      }),
    );
  });

  it('GET /payments/:id retourne un paiement existant', async () => {
    const payment = await dataSource.getRepository(PaymentOrmEntity).findOne({
      where: {},
      order: { id: 'DESC' },
    });

    const response = await request(app.getHttpServer())
      .get(`/payments/${payment!.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: payment!.id,
        status: PAYMENT_STATUS.SUCCEEDED,
        transactionId: 'pi_test_123',
      }),
    );
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

    paymentGateway.constructWebhookEvent = vi.fn().mockReturnValue({
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
