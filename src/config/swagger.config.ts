import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { isProductionEnv } from './env.config';
import {
  SWAGGER_CART_SESSION,
  SWAGGER_JWT,
  SWAGGER_TAGS,
} from '../shared/swagger/swagger.constants';

type EnvSource = NodeJS.ProcessEnv;

export function isSwaggerEnabled(env: EnvSource = process.env): boolean {
  const explicit = env.SWAGGER_ENABLED?.trim().toLowerCase();
  if (explicit === 'true') {
    return true;
  }
  if (explicit === 'false') {
    return false;
  }
  return !isProductionEnv(env);
}

export function getSwaggerPath(env: EnvSource = process.env): string {
  const configured = env.SWAGGER_PATH?.trim();
  return configured?.replace(/^\//, '') || 'docs';
}

export function setupSwagger(app: INestApplication): void {
  if (!isSwaggerEnabled()) {
    return;
  }

  const config = new DocumentBuilder()
    .setTitle('Airbnb API')
    .setDescription(
      [
        'API REST de la plateforme de réservation hôtelière.',
        '',
        '**Authentification** : header `Authorization: Bearer <token>` (obtenu via `POST /auth/login`).',
        '**Panier anonyme** : header `X-Cart-Session` (UUID) sur les routes `/cart` publiques.',
        '**Permissions** : routes admin/hôte protégées par RBAC (clés dans le JWT).',
      ].join('\n'),
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT obtenu via POST /auth/login',
      },
      SWAGGER_JWT,
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-Cart-Session',
        in: 'header',
        description: 'Session panier pour utilisateurs non connectés',
      },
      SWAGGER_CART_SESSION,
    )
    .addTag(SWAGGER_TAGS.HEALTH)
    .addTag(SWAGGER_TAGS.AUTH)
    .addTag(SWAGGER_TAGS.ROLES)
    .addTag(SWAGGER_TAGS.USERS)
    .addTag(SWAGGER_TAGS.PROPERTIES)
    .addTag(SWAGGER_TAGS.PROPERTY_TYPES)
    .addTag(SWAGGER_TAGS.ROOMS)
    .addTag(SWAGGER_TAGS.ROOM_TYPES)
    .addTag(SWAGGER_TAGS.AMENITIES)
    .addTag(SWAGGER_TAGS.HOST)
    .addTag(SWAGGER_TAGS.CART)
    .addTag(SWAGGER_TAGS.PAYMENTS)
    .addTag(SWAGGER_TAGS.RESERVATIONS)
    .addTag(SWAGGER_TAGS.INVOICES)
    .addTag(SWAGGER_TAGS.EMAILS)
    .addTag(SWAGGER_TAGS.MESSAGING)
    .addTag(SWAGGER_TAGS.FAVORITES)
    .addTag(SWAGGER_TAGS.REVIEWS)
    .addTag(SWAGGER_TAGS.IMPORT)
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey, methodKey) =>
      `${controllerKey}_${methodKey}`,
  });

  SwaggerModule.setup(getSwaggerPath(), app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Airbnb API — Documentation',
  });
}
