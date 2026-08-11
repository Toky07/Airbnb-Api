import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuthEntity } from '@src/modules/authentication/infrastructure/entity/auth.entity';
import * as bcrypt from 'bcrypt';
import { Role } from '@src/modules/authentication/infrastructure/entity/role.entity';
import { UserNameVO } from '@src/modules/user/contracts';
import { RoleEntity } from '@src/modules/authentication/domain/entities/role.entity';
import { RoleMapper } from '@src/modules/authentication/infrastructure/mappers/role.mappers';
import { UserEntity } from '@src/modules/user/infrastructure/entities/user.entity';
import {
  activateAuthAccountForTests,
  assignSuperAdminRole,
  clearEntitiesForTests,
} from '@src/test/controller-test.helpers';
import { setupE2eApp } from '@src/test/e2e-app';

describe('Auth', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    process.env.MAIL_TRANSPORT = 'console';
    const ctx = await setupE2eApp();
    app = ctx.app;
    dataSource = ctx.dataSource;
  });

  beforeEach(async () => {
    await clearEntitiesForTests(dataSource, [AuthEntity, UserEntity]);
  });

  it(`/POST auth/register`, async () => {
    process.env.MAIL_TRANSPORT = 'console';
    const repository = dataSource.getRepository(AuthEntity);
    const data = {
      email: 'test@test.com',
      firstName: 'Test',
      lastName: 'User',
      phoneNumber: '+33601020304',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(data)
      .expect(201);

    expect(response.body).toStrictEqual({ success: true });

    const auth = await repository.findOne({ where: { email: data.email } });
    expect(auth).toBeDefined();
    expect(auth?.status).toBe('pending');
    expect(auth?.password).toBeNull();
  });

  it(`/POST auth/login login with valid credentials`, async () => {
    const repository = dataSource.getRepository(AuthEntity);
    const data = {
      email: 'test@test.com',
      password: 'password',
    };

    await repository.save(
      repository.create({
        email: data.email,
        password: await bcrypt.hash(data.password, 4),
        status: 'active',
      }),
    );

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(data)
      .expect(200);

    expect(response.body).toStrictEqual({ token: expect.any(String) });
  });

  it(`/POST auth/login login with invalid credentials`, async () => {
    const repository = dataSource.getRepository(AuthEntity);
    const data = {
      email: 'test@test.com',
      password: 'password',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(data)
      .expect(401);
  });

  it(`/POST auth/assign-role`, async () => {
    const roleRepository = dataSource.getRepository(Role);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'admin@test.com',
        firstName: 'Admin',
        lastName: 'User',
        phoneNumber: '+33601020304',
      })
      .expect(201);

    await activateAuthAccountForTests(dataSource, 'admin@test.com', 'password');
    await assignSuperAdminRole(dataSource, 'admin@test.com');

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'password' })
      .expect(200);

    const userRepository = dataSource.getRepository(AuthEntity);
    await userRepository.save(
      userRepository.create({
        email: 'staff@test.com',
        password: await bcrypt.hash('password', 4),
        status: 'active',
      }),
    );

    const staff = await userRepository.findOne({
      where: { email: 'staff@test.com' },
    });

    const role = await roleRepository.save(
      roleRepository.create(
        RoleMapper.toEntity(
          new RoleEntity(new UserNameVO('Éditeur'), 'editeur'),
        ),
      ),
    );

    const response = await request(app.getHttpServer())
      .post('/auth/assign-role')
      .set('Authorization', `Bearer ${loginResponse.body.token}`)
      .send({
        userId: staff!.id,
        roleId: [role.id],
      })
      .expect(200);

    expect(response.body).toStrictEqual({ success: true });
  });
});
