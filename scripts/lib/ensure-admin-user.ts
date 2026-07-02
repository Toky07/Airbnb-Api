import * as bcrypt from 'bcrypt';
import type { DataSource } from 'typeorm';
import { ACCOUNT_STATUS } from '../../src/modules/authentication/domain/constants/account-status.constant';
import { SUPERADMIN_ROLE_SLUG } from '../../src/modules/authentication/domain/constants/permissions.constant';
import { AuthEntity } from '../../src/modules/authentication/infrastructure/entity/auth.entity';
import { Role } from '../../src/modules/authentication/infrastructure/entity/role.entity';
import { UserEntity } from '../../src/modules/user/infrastructure/entities/user.entity';

export const ADMIN_ACCOUNT = {
  email: 'admin@example.com',
  password: '1234',
  firstName: 'Admin',
  lastName: 'Example',
  phoneNumber: '+33600000000',
} as const;

export async function ensureAdminUser(dataSource: DataSource): Promise<void> {
  const userRepo = dataSource.getRepository(UserEntity);
  const authRepo = dataSource.getRepository(AuthEntity);
  const roleRepo = dataSource.getRepository(Role);
  const normalizedEmail = ADMIN_ACCOUNT.email.trim().toLowerCase();

  const existingAuth = await authRepo.findOne({
    where: { email: normalizedEmail },
    relations: ['roles'],
  });
  const existingUser = await userRepo.findOne({
    where: { email: normalizedEmail },
  });

  if (existingAuth && existingUser?.authId === existingAuth.id) {
    console.log('Utilisateur admin déjà présent, ignoré.');
    return;
  }

  const passwordHash = await bcrypt.hash(ADMIN_ACCOUNT.password, 10);

  const user =
    existingUser ??
    (await userRepo.save(
      userRepo.create({
        firstName: ADMIN_ACCOUNT.firstName,
        lastName: ADMIN_ACCOUNT.lastName,
        email: normalizedEmail,
        phoneNumber: ADMIN_ACCOUNT.phoneNumber,
        avatar: '',
        status: ACCOUNT_STATUS.ACTIVE,
      }),
    ));

  const auth =
    existingAuth ??
    (await authRepo.save(
      authRepo.create({
        email: normalizedEmail,
        password: passwordHash,
        status: ACCOUNT_STATUS.ACTIVE,
      }),
    ));

  if (!auth.password) {
    await authRepo.update(auth.id, {
      password: passwordHash,
      status: ACCOUNT_STATUS.ACTIVE,
    });
  }

  await userRepo.update(user.id, {
    authId: auth.id,
    status: ACCOUNT_STATUS.ACTIVE,
  });

  const superAdmin = await roleRepo.findOne({
    where: { slug: SUPERADMIN_ROLE_SLUG },
    relations: ['permissions'],
  });

  if (superAdmin) {
    auth.roles = [superAdmin];
    await authRepo.save(auth);
  }

  console.log(
    `Utilisateur admin prêt : ${ADMIN_ACCOUNT.email} / ${ADMIN_ACCOUNT.password}`,
  );
}
