import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { SUPERADMIN_ROLE_SLUG } from '../modules/authentication/domain/constants/permissions.constant';
import { AuthEntity } from '../modules/authentication/infrastructure/entity/auth.entity';
import { PermissionEntity } from '../modules/authentication/infrastructure/entity/permission.entity';
import { Role } from '../modules/authentication/infrastructure/entity/role.entity';
import { EmailOrmEntity } from '../modules/mail/infrastructure/entities/email.orm-entity';
import { MediaOrmEntity } from '../modules/media/infrastructure/entities/media-orm.entity';
import { PropertyTypeEntity } from '../modules/properties/infrastructure/entities/property-type.entity';
import { PropertyEntity } from '../modules/properties/infrastructure/entities/property-entity.entity';
import { RoomTypeEntity } from '../modules/rooms/infrastructure/entities/room-type.entity';
import { RoomEntity } from '../modules/rooms/infrastructure/entities/room.entity';
import { UserEntity } from '../modules/user/infrastructure/entities/user.entity';
import { ACCOUNT_STATUS } from '../modules/authentication/domain/constants/account-status.constant';
import { PasswordSetupTokenOrmEntity } from '../modules/authentication/infrastructure/entities/password-setup-token.orm-entity';
import { ReservationOrmEntity } from '../modules/reservation/infrastructure/entities/reservation.orm-entity';
import { ReservationItemOrmEntity } from '../modules/reservation/infrastructure/entities/reservation-item.orm-entity';
import { AmenityOrmEntity } from '../modules/amenity/infrastructure/entities/amenity.orm-entity';
import { PropertyAmenityOrmEntity } from '../modules/amenity/infrastructure/entities/property-amenity.orm-entity';
import { RoomAmenityOrmEntity } from '../modules/amenity/infrastructure/entities/room-amenity.orm-entity';
import { PaymentOrmEntity } from '../modules/payment/infrastructure/entities/payment.orm-entity';
import { CartOrmEntity } from '../modules/cart/infrastructure/entities/cart.orm-entity';
import { CartItemOrmEntity } from '../modules/cart/infrastructure/entities/cart-item.orm-entity';

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
] as const;

export async function assignSuperAdminRole(
  dataSource: DataSource,
  email: string,
): Promise<void> {
  const authRepo = dataSource.getRepository(AuthEntity);
  const roleRepo = dataSource.getRepository(Role);
  const auth = await authRepo.findOne({
    where: { email: email.trim().toLowerCase() },
    relations: ['roles'],
  });
  const superAdmin = await roleRepo.findOne({
    where: { slug: SUPERADMIN_ROLE_SLUG },
    relations: ['permissions'],
  });

  if (!auth?.id || !superAdmin?.id) {
    return;
  }

  auth.roles = [superAdmin];
  await authRepo.save(auth);
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
    password: await bcrypt.hash(password, 10),
    status: ACCOUNT_STATUS.ACTIVE,
  });

  await userRepo.update({ email: normalizedEmail }, { status: ACCOUNT_STATUS.ACTIVE });
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

  await activateAuthAccountForTests(dataSource, payload.email, payload.password);
  await assignSuperAdminRole(dataSource, payload.email);

  const login = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email: payload.email, password: payload.password })
    .expect(200);

  return login.body.token as string;
}
