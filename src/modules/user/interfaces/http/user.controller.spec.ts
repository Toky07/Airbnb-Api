import request from 'supertest';
import { Test } from '@nestjs/testing';
import { UserModule } from '../../user.module';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../infrastructure/entities/user.entity';
import { DataSource } from 'typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthEntity } from '../../../authentication/infrastructure/entity/auth.entity';
import { Auth } from '../../../authentication/domain/entities/user.entity';
import { EmailVO } from '../../../../shared/valueObject/email.vo';
import * as bcrypt from 'bcrypt';
import { AuthModule } from '../../../authentication/auth.module';
import { AuthMapper } from '../../../authentication/infrastructure/mappers/auth.mappers';
import { Role } from '../../../authentication/infrastructure/entity/role.entity';
import { PermissionEntity } from '../../../authentication/infrastructure/entity/permission.entity';
import { MediaOrmEntity } from '../../../media/infrastructure/entities/media-orm.entity';
import { rm } from 'fs/promises';
import {
  AUTH_TEST_ENTITIES,
  DOMAIN_TEST_ENTITIES,
  registerAndLoginAsSuperAdmin,
} from '../../../../test/controller-test.helpers';

describe('UserController', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let token: string;

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
        JwtModule.register({
          global: true,
          secret: '1234',
          secretOrPrivateKey: '1234',
          signOptions: { expiresIn: '5h' },
        }),
        UserModule,
        AuthModule,
      ],
    }).compile();

    dataSource = moduleRef.get(DataSource);

    app = moduleRef.createNestApplication();
    await app.init();

    token = await registerAndLoginAsSuperAdmin(app, dataSource, {
      email: 'test@test.com',
      password: '123456',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+33601020304',
    });
  });

  beforeEach(async () => {
    const repository = dataSource.getRepository(UserEntity);
    await repository.clear();
  });

  it(`/GET users`, async () => {
    const repository = dataSource.getRepository(UserEntity);
    const data = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@test.com',
      phoneNumber: '+1234567890',
      avatar: 'avatar.png',
    };

    await repository.save({ ...data });

    const response = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.data[0]).toEqual(expect.objectContaining({
      id: expect.any(Number),
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@test.com',
      phoneNumber: '+1234567890',
      avatar: 'avatar.png',
      roles: expect.any(Array),
      authLinked: expect.any(Boolean),
      status: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    }));
  });

  it(`/GET users/:id`, async () => {
    const repository = dataSource.getRepository(UserEntity);
    const data = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@test.com',
      phoneNumber: '+1234567890',
      avatar: 'avatar.png',
    };

    const user = await repository.save({ ...data });

    const response = await request(app.getHttpServer())
      .get(`/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual({
      id: user.id,
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@test.com',
      phoneNumber: '+1234567890',
      avatar: 'avatar.png',
      roles: expect.any(Array),
      authLinked: expect.any(Boolean),
      status: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it('/POST users', async () => {
    const response = await request(app.getHttpServer())
      .post('/users')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'newuser@test.com',
        phoneNumber: '+1234567890',
        avatar: 'avatar.png',
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    expect(response.body).toEqual({
      id: expect.any(Number),
      firstName: 'John',
      lastName: 'Doe',
      email: 'newuser@test.com',
      phoneNumber: '+1234567890',
      avatar: 'avatar.png',
      roles: expect.any(Array),
      authLinked: expect.any(Boolean),
      status: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it('/POST users returns 400 for invalid phone number', async () => {
    const response = await request(app.getHttpServer())
      .post('/users')
      .send({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@test.test',
        phoneNumber: '0123456789',
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(400);

    expect(response.body.statusCode).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'phoneNumber',
          message: expect.stringContaining('téléphone'),
        }),
      ]),
    );
  });

  it('/POST users with avatar file', async () => {
    const response = await request(app.getHttpServer())
      .post('/users')
      .field('firstName', 'Jane')
      .field('lastName', 'Doe')
      .field('email', 'jane@test.com')
      .field('phoneNumber', '+1234567890')
      .attach('avatar', Buffer.from('user-avatar'), 'avatar.jpg')
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    expect(response.body.avatar).toMatch(/uploads\/users\/\d+\/.+\.jpg$/);
    expect(response.body.firstName).toBe('Jane');
  });

  it('/POST users with avatar data URL', async () => {
    const buffer = Buffer.from('data-url-avatar');
    const dataUrl = `data:image/png;base64,${buffer.toString('base64')}`;

    const response = await request(app.getHttpServer())
      .post('/users')
      .send({
        firstName: 'Alex',
        lastName: 'Smith',
        email: 'alex@test.com',
        phoneNumber: '+1234567891',
        avatar: dataUrl,
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    expect(response.body.avatar).toMatch(/uploads\/users\/\d+\/.+\.png$/);
  });

  it('/PUT users/:id', async () => {
    const repository = dataSource.getRepository(UserEntity);
    const data = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@test.com',
      phoneNumber: '+1234567890',
      avatar: 'avatar.png',
    };

    const user = await repository.save({ ...data });

    await request(app.getHttpServer())
      .put(`/users/${user.id}`)
      .send({
        firstName: 'Updated',
        lastName: 'Updated',
        email: 'updated@test.com',
        phoneNumber: '+1234567891',
        avatar: 'avatar.png',
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const updatedUser = await repository.findOne({ where: { id: user.id } });

    expect(updatedUser).toEqual(expect.objectContaining({
      id: expect.any(Number),
      firstName: 'Updated',
      lastName: 'Updated',
      email: 'updated@test.com',
      phoneNumber: '+1234567891',
      avatar: 'avatar.png',
    }));
  });

  it('/PUT users/:id with avatar file', async () => {
    const repository = dataSource.getRepository(UserEntity);
    const user = await repository.save({
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@test.com',
      phoneNumber: '+1234567890',
      avatar: '',
    });

    const response = await request(app.getHttpServer())
      .put(`/users/${user.id}`)
      .field('firstName', 'John')
      .field('lastName', 'Doe')
      .field('email', 'test@test.com')
      .field('phoneNumber', '+1234567890')
      .attach('avatar', Buffer.from('updated-avatar'), 'updated.jpg')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.avatar).toMatch(/uploads\/users\/\d+\/.+\.jpg$/);
  });

  it('/DELETE users/:id', async () => {
    const repository = dataSource.getRepository(UserEntity);
    const authRepository = dataSource.getRepository(AuthEntity);
    const data = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'delete-user@test.com',
      phoneNumber: '+1234567890',
      avatar: 'avatar.png',
    };

    const auth = await authRepository.save({
      email: data.email,
      password: 'hashed-password',
      status: 'active',
    });
    const user = await repository.save({ ...data, authId: auth.id });

    await request(app.getHttpServer())
      .delete(`/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const deletedUser = await repository.findOne({ where: { id: user.id } });
    expect(deletedUser).toBeNull();

    const deletedAuth = await authRepository.findOne({ where: { id: auth.id } });
    expect(deletedAuth).toBeNull();

    await request(app.getHttpServer())
      .get(`/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  afterAll(async () => {
    await app.close();
    await rm('uploads', { recursive: true, force: true });
  });
});
