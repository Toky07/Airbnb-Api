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

describe('Cats', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let token: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: 'test.sqlite',
          entities: [UserEntity, AuthEntity],
          synchronize: true,
        }),
        JwtModule.register({
          global: true,
          secret: '1234',
          secretOrPrivateKey: '1234',
          signOptions: { expiresIn: '1h' },
        }),
        UserModule,
        AuthModule,
      ],
    }).compile();

    dataSource = moduleRef.get(DataSource);
    app = moduleRef.createNestApplication();
    await app.init();
  });

  beforeEach(async () => {

    const authRepository = dataSource.getRepository(AuthEntity);
    const admin = await authRepository.create(new Auth(
      new EmailVO('test@test.com'),
      await bcrypt.hash('123456', 10),
    ));
    authRepository.save(admin);

    const login = async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@test.com',
          password: '123456',
        });

      return response.body.token;
    };

    token = await login();

    const repository = dataSource.getRepository(UserEntity);
    await repository.clear();
  });

  it(`/GET users`, async () => {
    const repository = dataSource.getRepository(UserEntity);
    const data = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@test.com',
    };

    await repository.save({ ...data });

    const response = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual([{
      id: expect.any(Number),
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@test.com',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    }]);
  });

  it('/POST users', async () => {
    const response = await request(app.getHttpServer())
      .post('/users')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@test.com',
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    expect(response.body).toEqual({
      id: expect.any(Number),
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@test.com',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it('/PUT users/:id', async () => {
    const repository = dataSource.getRepository(UserEntity);
    const data = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@test.com',
    };

    const user = await repository.save({ ...data });

    await request(app.getHttpServer())
      .put(`/users/${user.id}`)
      .send({
        firstName: 'Updated',
        lastName: 'Updated',
        email: 'updated@test.com',
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const updatedUser = await repository.findOne({ where: { id: user.id } });

    expect(updatedUser).toEqual({
      id: expect.any(Number),
      firstName: 'Updated',
      lastName: 'Updated',
      email: 'updated@test.com',
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });

  it('/DELETE users/:id', async () => {
    const repository = dataSource.getRepository(UserEntity);
    const data = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@test.com',
    };

    const user = await repository.save({ ...data });

    await request(app.getHttpServer())
      .delete(`/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const deletedUser = await repository.findOne({ where: { id: user.id } });
    expect(deletedUser).toBeNull();

    request(app.getHttpServer())
      .get(`/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  afterAll(async () => {
    await app.close();
  });
});
