import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserEntity } from '@src/modules/user/infrastructure/entities/user.entity';
import { AuthEntity } from '@src/modules/authentication/infrastructure/entity/auth.entity';
import {
  clearEntitiesForTests,
  registerAndLoginAsSuperAdmin,
} from '@src/test/controller-test.helpers';
import { setupE2eApp } from '@src/test/e2e-app';

describe('UserController', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let token: string;

  beforeAll(async () => {
    process.env.MAIL_TRANSPORT = 'console';
    const ctx = await setupE2eApp();
    app = ctx.app;
    dataSource = ctx.dataSource;

    token = await registerAndLoginAsSuperAdmin(app, dataSource, {
      email: 'test@test.com',
      password: '123456',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+33601020304',
    });
  });

  beforeEach(async () => {
    await clearEntitiesForTests(dataSource, [UserEntity]);
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

    expect(response.body.data[0]).toEqual(
      expect.objectContaining({
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
      }),
    );
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

    expect(response.body.avatar).toMatch(
      /uploads\/users\/\d+\/avatar\/.+\.jpg$/,
    );
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

    expect(response.body.avatar).toMatch(
      /uploads\/users\/\d+\/avatar\/.+\.png$/,
    );
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

    expect(updatedUser).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        firstName: 'Updated',
        lastName: 'Updated',
        email: 'updated@test.com',
        phoneNumber: '+1234567891',
        avatar: 'avatar.png',
      }),
    );
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

    expect(response.body.avatar).toMatch(
      /uploads\/users\/\d+\/avatar\/.+\.jpg$/,
    );
  });

  it('/PUT users/:id/password sets password and activates pending user', async () => {
    const repository = dataSource.getRepository(UserEntity);
    const user = await repository.save({
      firstName: 'Pending',
      lastName: 'User',
      email: 'pending-password@test.com',
      phoneNumber: '+1234567890',
      avatar: '',
    });

    const response = await request(app.getHttpServer())
      .put(`/users/${user.id}/password`)
      .send({ password: 'secret12' })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.status).toBe('active');
    expect(response.body.authLinked).toBe(true);
  });

  it('/PUT users/:id/status disables and reactivates user', async () => {
    const repository = dataSource.getRepository(UserEntity);
    const authRepository = dataSource.getRepository(AuthEntity);

    const auth = await authRepository.save({
      email: 'status-user@test.com',
      password: 'hashed-password',
      status: 'active',
    });
    const user = await repository.save({
      firstName: 'Status',
      lastName: 'User',
      email: 'status-user@test.com',
      phoneNumber: '+1234567890',
      avatar: '',
      authId: auth.id,
      status: 'active',
    });

    const disabled = await request(app.getHttpServer())
      .put(`/users/${user.id}/status`)
      .send({ status: 'disabled' })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(disabled.body.status).toBe('disabled');

    const reactivated = await request(app.getHttpServer())
      .put(`/users/${user.id}/status`)
      .send({ status: 'active' })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(reactivated.body.status).toBe('active');
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

    const deletedAuth = await authRepository.findOne({
      where: { id: auth.id },
    });
    expect(deletedAuth).toBeNull();

    await request(app.getHttpServer())
      .get(`/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });
});
