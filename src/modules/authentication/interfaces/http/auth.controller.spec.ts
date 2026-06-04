import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AuthModule } from '../../auth.module';
import { AuthEntity } from '../../infrastructure/entity/auth.entity';
import * as bcrypt from 'bcrypt';
import { Role } from '../../infrastructure/entity/role.entity';
import { PermissionEntity } from '../../infrastructure/entity/permission.entity';
import { UserNameVO } from '../../../user/domain/valueObject/username.vo';
import { RoleEntity } from '../../domain/entities/role.entity';
import { RoleMapper } from '../../infrastructure/mappers/role.mappers';
import { UserEntity } from '../../../user/infrastructure/entities/user.entity';
import {
  activateAuthAccountForTests,
  assignSuperAdminRole,
  AUTH_TEST_ENTITIES,
  DOMAIN_TEST_ENTITIES,
} from '../../../../test/controller-test.helpers';

describe('Auth', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    process.env.MAIL_TRANSPORT = 'console';

    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [...AUTH_TEST_ENTITIES, ...DOMAIN_TEST_ENTITIES],
          synchronize: true,
        }),
        AuthModule,
      ],
    }).compile();

    dataSource = moduleRef.get(DataSource);
    app = moduleRef.createNestApplication();
    await app.init();
  });

  beforeEach(async () => {
    await dataSource.getRepository(AuthEntity).clear();
    await dataSource.getRepository(UserEntity).clear();
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
        password: await bcrypt.hash(data.password, 10),
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
        password: await bcrypt.hash('password', 10),
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
