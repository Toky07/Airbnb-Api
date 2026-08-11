import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { Test, type TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AmenityModule } from '@src/modules/amenity/amenity.module';
import { AuthModule } from '@src/modules/authentication/auth.module';
import { CartModule } from '@src/modules/cart/cart.module';
import { FavoriteModule } from '@src/modules/favorite/favorite.module';
import { HostModule } from '@src/modules/host/host.module';
import { ImportModule } from '@src/modules/import/import.module';
import { InvoiceModule } from '@src/modules/invoice/invoice.module';
import { MailModule } from '@src/modules/mail/mail.module';
import { MessagingModule } from '@src/modules/messaging/messaging.module';
import {
  createPaymentGatewayMock,
  createWebhookVerifierMock,
} from '@src/modules/payment/applications/useCase/payment-test.helpers';
import { PAYMENT_GATEWAY } from '@src/modules/payment/domain/ports/payment-gateway.port';
import { StripeWebhookVerifier } from '@src/modules/payment/infrastructure/stripe/StripeWebhookVerifier';
import { PaymentModule } from '@src/modules/payment/payment.module';
import { PropertiesModule } from '@src/modules/properties/properties.module';
import { ReservationModule } from '@src/modules/reservation/reservation.module';
import { ReviewModule } from '@src/modules/review/review.module';
import { RoomsModule } from '@src/modules/rooms/room.module';
import { UserModule } from '@src/modules/user/user.module';
import { TYPEORM_ENTITIES } from '@src/config/typeorm.entities';
import {
  getIntegrationTestDatabaseConfig,
  prepareIntegrationTestDatabase,
  truncateIntegrationTables,
} from '@src/test/test-database.config';

const E2E_APP_STATE_KEY = '__airbnb_e2e_app_state__';

export type E2eAppContext = {
  app: INestApplication;
  dataSource: DataSource;
  moduleRef: TestingModule;
  paymentGateway: ReturnType<typeof createPaymentGatewayMock>;
  webhookVerifier: ReturnType<typeof createWebhookVerifierMock>;
};

type E2eAppState = {
  bootPromise: Promise<E2eAppContext> | null;
  context: E2eAppContext | null;
};

function getE2eAppState(): E2eAppState {
  const globalState = globalThis as typeof globalThis & {
    [E2E_APP_STATE_KEY]?: E2eAppState;
  };

  if (!globalState[E2E_APP_STATE_KEY]) {
    globalState[E2E_APP_STATE_KEY] = {
      bootPromise: null,
      context: null,
    };
  }

  return globalState[E2E_APP_STATE_KEY];
}

function resetPaymentMocks(context: E2eAppContext): void {
  const freshGateway = createPaymentGatewayMock();
  const freshVerifier = createWebhookVerifierMock();
  Object.assign(context.paymentGateway, freshGateway);
  Object.assign(context.webhookVerifier, freshVerifier);
}

async function resetSharedE2eApp(context: E2eAppContext): Promise<void> {
  await truncateIntegrationTables(context.dataSource, {
    preserveCatalog: true,
  });
  resetPaymentMocks(context);
}

async function bootE2eApp(): Promise<E2eAppContext> {
  process.env.MAIL_TRANSPORT = process.env.MAIL_TRANSPORT ?? 'console';
  process.env.STRIPE_PUBLISHABLE_KEY =
    process.env.STRIPE_PUBLISHABLE_KEY ?? 'pk_test_e2e';

  await prepareIntegrationTestDatabase();

  const paymentGateway = createPaymentGatewayMock();
  const webhookVerifier = createWebhookVerifierMock();

  const moduleRef = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot(getIntegrationTestDatabaseConfig(TYPEORM_ENTITIES)),
      JwtModule.register({
        global: true,
        secret: process.env.JWT_SECRET ?? '1234',
        signOptions: { expiresIn: '5h' },
      }),
      AuthModule,
      UserModule,
      PropertiesModule,
      RoomsModule,
      HostModule,
      ImportModule,
      MailModule,
      PaymentModule,
      ReservationModule,
      CartModule,
      InvoiceModule,
      AmenityModule,
      MessagingModule,
      FavoriteModule,
      ReviewModule,
    ],
  })
    .overrideProvider(PAYMENT_GATEWAY)
    .useValue(paymentGateway)
    .overrideProvider(StripeWebhookVerifier)
    .useValue(webhookVerifier)
    .compile();

  const dataSource = moduleRef.get(DataSource);
  const app = moduleRef.createNestApplication({ rawBody: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.init();

  return {
    app,
    dataSource,
    moduleRef,
    paymentGateway,
    webhookVerifier,
  };
}

/**
 * Boots the Nest e2e app once per worker and reuses it across controller specs.
 * Between files: truncate mutable tables while keeping catalog seeds.
 */
export async function setupE2eApp(): Promise<E2eAppContext> {
  const state = getE2eAppState();

  if (state.context) {
    await resetSharedE2eApp(state.context);
    return state.context;
  }

  if (!state.bootPromise) {
    state.bootPromise = bootE2eApp().then((context) => {
      process.once('beforeExit', () => {
        void closeE2eApp();
      });
      return context;
    });
  }

  state.context = await state.bootPromise;
  return state.context;
}

export async function closeE2eApp(): Promise<void> {
  const state = getE2eAppState();
  const context = state.context;
  state.context = null;
  state.bootPromise = null;

  if (context?.app) {
    await context.app.close();
  }
}
