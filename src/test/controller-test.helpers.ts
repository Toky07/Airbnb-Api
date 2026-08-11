import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  HOST_ROLE_SLUG,
  SUPERADMIN_ROLE_SLUG,
} from '@src/modules/authentication/contracts';
import { AuthEntity } from '@src/modules/authentication/infrastructure/entity/auth.entity';
import { PermissionEntity } from '@src/modules/authentication/infrastructure/entity/permission.entity';
import { Role } from '@src/modules/authentication/infrastructure/entity/role.entity';
import { EmailOrmEntity } from '@src/modules/mail/infrastructure/entities/email.orm-entity';
import { MediaOrmEntity } from '@src/modules/media/infrastructure/entities/media-orm.entity';
import { PropertyTypeEntity } from '@src/modules/properties/infrastructure/entities/property-type.entity';
import { PropertyEntity } from '@src/modules/properties/infrastructure/entities/property-entity.entity';
import { RoomTypeEntity } from '@src/modules/rooms/infrastructure/entities/room-type.entity';
import { RoomEntity } from '@src/modules/rooms/infrastructure/entities/room.entity';
import { RoomBlockedDateOrmEntity } from '@src/modules/rooms/infrastructure/entities/room-blocked-date.orm-entity';
import { RoomRateOverrideOrmEntity } from '@src/modules/rooms/infrastructure/entities/room-rate-override.orm-entity';
import { UserEntity } from '@src/modules/user/infrastructure/entities/user.entity';
import { ACCOUNT_STATUS } from '@src/modules/authentication/contracts';
import { PasswordSetupTokenOrmEntity } from '@src/modules/authentication/infrastructure/entities/password-setup-token.orm-entity';
import { ReservationOrmEntity } from '@src/modules/reservation/infrastructure/entities/reservation.orm-entity';
import { ReservationItemOrmEntity } from '@src/modules/reservation/infrastructure/entities/reservation-item.orm-entity';
import { AmenityOrmEntity } from '@src/modules/amenity/infrastructure/entities/amenity.orm-entity';
import { PropertyAmenityOrmEntity } from '@src/modules/amenity/infrastructure/entities/property-amenity.orm-entity';
import { RoomAmenityOrmEntity } from '@src/modules/amenity/infrastructure/entities/room-amenity.orm-entity';
import { PaymentOrmEntity } from '@src/modules/payment/infrastructure/entities/payment.orm-entity';
import { CartOrmEntity } from '@src/modules/cart/infrastructure/entities/cart.orm-entity';
import { CartItemOrmEntity } from '@src/modules/cart/infrastructure/entities/cart-item.orm-entity';
import { InvoiceOrmEntity } from '@src/modules/invoice/infrastructure/entities/invoice.orm-entity';
import { InvoiceSequenceOrmEntity } from '@src/modules/invoice/infrastructure/entities/invoice-sequence.orm-entity';
import { ConversationOrmEntity } from '@src/modules/messaging/infrastructure/entities/conversation.orm-entity';
import { MessageOrmEntity } from '@src/modules/messaging/infrastructure/entities/message.orm-entity';
import { FavoriteOrmEntity } from '@src/modules/favorite/infrastructure/entities/favorite.orm-entity';
import { ReviewOrmEntity } from '@src/modules/review/infrastructure/entities/review.orm-entity';

export type RegisterPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
};

export const DEFAULT_REGISTER: RegisterPayload = {
  email: 'admin@test.com',
  password: '123456',
  firstName: 'Admin',
  lastName: 'Test',
  phoneNumber: '+33601020304',
};

export const AUTH_TEST_ENTITIES = [
  AuthEntity,
  Role,
  PermissionEntity,
  UserEntity,
  PasswordSetupTokenOrmEntity,
] as const;

export const DOMAIN_TEST_ENTITIES = [
  PropertyEntity,
  PropertyTypeEntity,
  RoomEntity,
  RoomTypeEntity,
  RoomBlockedDateOrmEntity,
  RoomRateOverrideOrmEntity,
  MediaOrmEntity,
  EmailOrmEntity,
  ReservationOrmEntity,
  ReservationItemOrmEntity,
  PaymentOrmEntity,
  CartOrmEntity,
  CartItemOrmEntity,
  AmenityOrmEntity,
  PropertyAmenityOrmEntity,
  RoomAmenityOrmEntity,
  InvoiceOrmEntity,
  InvoiceSequenceOrmEntity,
  ConversationOrmEntity,
  MessageOrmEntity,
  FavoriteOrmEntity,
  ReviewOrmEntity,
] as const;

const passwordHashCache = new Map<string, Promise<string>>();

function hashPasswordForTests(password: string): Promise<string> {
  const cacheKey = `${password}:4`;
  const existing = passwordHashCache.get(cacheKey);
  if (existing) {
    return existing;
  }

  // Cost 4 is enough for tests and much faster than production rounds.
  const hashPromise = bcrypt.hash(password, 4);
  passwordHashCache.set(cacheKey, hashPromise);
  return hashPromise;
}

async function assignRoleBySlug(
  dataSource: DataSource,
  email: string,
  roleSlug: string,
  replaceExisting = false,
): Promise<void> {
  const authRepo = dataSource.getRepository(AuthEntity);
  const roleRepo = dataSource.getRepository(Role);
  const auth = await authRepo.findOne({
    where: { email: email.trim().toLowerCase() },
    relations: ['roles'],
  });
  const role = await roleRepo.findOne({
    where: { slug: roleSlug },
    relations: ['permissions'],
  });

  if (!auth?.id || !role?.id) {
    return;
  }

  if (replaceExisting) {
    auth.roles = [role];
  } else {
    const currentRoles = auth.roles ?? [];
    const alreadyHasRole = currentRoles.some((item) => item.slug === roleSlug);
    if (!alreadyHasRole) {
      auth.roles = [...currentRoles, role];
    }
  }

  await authRepo.save(auth);
}

export async function assignSuperAdminRole(
  dataSource: DataSource,
  email: string,
): Promise<void> {
  await assignRoleBySlug(dataSource, email, SUPERADMIN_ROLE_SLUG, true);
}

export async function assignHostRole(
  dataSource: DataSource,
  email: string,
): Promise<void> {
  await assignRoleBySlug(dataSource, email, HOST_ROLE_SLUG);
}

export async function activateAuthAccountForTests(
  dataSource: DataSource,
  email: string,
  password: string,
): Promise<void> {
  const authRepo = dataSource.getRepository(AuthEntity);
  const userRepo = dataSource.getRepository(UserEntity);
  const normalizedEmail = email.trim().toLowerCase();
  const auth = await authRepo.findOne({ where: { email: normalizedEmail } });

  if (!auth?.id) {
    return;
  }

  await authRepo.update(auth.id, {
    password: await hashPasswordForTests(password),
    status: ACCOUNT_STATUS.ACTIVE,
  });

  await userRepo.update(
    { email: normalizedEmail },
    { status: ACCOUNT_STATUS.ACTIVE },
  );
}

export async function registerAndLoginAsSuperAdmin(
  app: INestApplication,
  dataSource: DataSource,
  payload: RegisterPayload = DEFAULT_REGISTER,
): Promise<string> {
  process.env.MAIL_TRANSPORT = process.env.MAIL_TRANSPORT ?? 'console';

  await request(app.getHttpServer())
    .post('/auth/register')
    .send({
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      phoneNumber: payload.phoneNumber,
    })
    .expect(201);

  await activateAuthAccountForTests(
    dataSource,
    payload.email,
    payload.password,
  );
  await assignSuperAdminRole(dataSource, payload.email);

  const login = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email: payload.email, password: payload.password })
    .expect(200);

  return login.body.token as string;
}

export async function registerAndLoginAsHost(
  app: INestApplication,
  dataSource: DataSource,
  payload: RegisterPayload = {
    email: 'host@test.com',
    password: '123456',
    firstName: 'Host',
    lastName: 'Test',
    phoneNumber: '+33601020304',
  },
): Promise<string> {
  process.env.MAIL_TRANSPORT = process.env.MAIL_TRANSPORT ?? 'console';

  await request(app.getHttpServer())
    .post('/auth/register')
    .send({
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      phoneNumber: payload.phoneNumber,
    })
    .expect(201);

  await activateAuthAccountForTests(
    dataSource,
    payload.email,
    payload.password,
  );
  await assignHostRole(dataSource, payload.email);

  const login = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email: payload.email, password: payload.password })
    .expect(200);

  return login.body.token as string;
}

export async function clearEntitiesForTests(
  dataSource: DataSource,
  entities: Parameters<DataSource['getRepository']>[0][],
): Promise<void> {
  if (process.env.DB_TYPE === 'sqlite') {
    for (const entity of entities) {
      await dataSource.getRepository(entity).clear();
    }
    return;
  }

  const tableNames = [
    ...new Set(
      entities.map((entity) => dataSource.getMetadata(entity).tableName),
    ),
  ]
    .map((name) => `"${name}"`)
    .join(', ');

  if (tableNames.length > 0) {
    await dataSource.query(
      `TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE`,
    );
  }
}
