import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { AuthModule } from '@src/modules/authentication/auth.module';
import { MailModule } from '@src/modules/mail/mail.module';
import { UserModule } from '@src/modules/user/user.module';
import { AuthEntity } from '@src/modules/authentication/infrastructure/entity/auth.entity';
import * as bcrypt from 'bcrypt';
import { Role } from '@src/modules/authentication/infrastructure/entity/role.entity';
import { PermissionEntity } from '@src/modules/authentication/infrastructure/entity/permission.entity';
import { UserNameVO } from '@src/modules/user/contracts';
import { RoleEntity } from '@src/modules/authentication/domain/entities/role.entity';
import { RoleMapper } from '@src/modules/authentication/infrastructure/mappers/role.mappers';
import { UserEntity } from '@src/modules/user/infrastructure/entities/user.entity';
import {
  activateAuthAccountForTests,
  assignSuperAdminRole,
  AUTH_TEST_ENTITIES,
  clearEntitiesForTests,
  DOMAIN_TEST_ENTITIES,
} from '@src/test/controller-test.helpers';
import {
  getIntegrationTestDatabaseConfig,
  prepareIntegrationTestDatabase,
} from '@src/test/test-database.config';

describe('Auth', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    process.env.MAIL_TRANSPORT = 'console';
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
        MailModule,
        UserModule,
        AuthModule,
      ],
    }).compile();

    dataSource = moduleRef.get(DataSource);
    app = moduleRef.createNestApplication();
    await app.init();
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

  afterAll(async () => {
    await app.close();
  });
});
