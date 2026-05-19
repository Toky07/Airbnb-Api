import request from 'supertest';
import { Test } from '@nestjs/testing';
import { UserModule } from '../../user.module';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../infrastructure/entities/user.entity';
import { DataSource } from 'typeorm';

describe('Cats', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: 'test.sqlite',
          entities: [UserEntity],
          synchronize: true,
        }),
        UserModule,
      ],
    }).compile();

    dataSource = moduleRef.get(DataSource);
    app = moduleRef.createNestApplication();
    await app.init();
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
      password: 'password',
    };

    await repository.save({ ...data });

    const response = await request(app.getHttpServer())
      .get('/users')
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

  it.only('/POST users', async () => {
    const response = await request(app.getHttpServer())
      .post('/users')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@test.com',
        password: 'password',
      })
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
      password: 'password',
    };

    const user = await repository.save({ ...data });

    await request(app.getHttpServer())
      .put(`/users/${user.id}`)
      .send({
        firstName: 'Updated',
        lastName: 'Updated',
        email: 'updated@test.com',
      })
      .expect(200);

    const updatedUser = await repository.findOne({ where: { id: user.id } });

    expect(updatedUser).toEqual({
      id: expect.any(Number),
      firstName: 'Updated',
      lastName: 'Updated',
      email: 'updated@test.com',
      password: undefined,
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
      password: 'password',
    };

    const user = await repository.save({ ...data });

    await request(app.getHttpServer())
      .delete(`/users/${user.id}`)
      .expect(200);

    const deletedUser = await repository.findOne({ where: { id: user.id } });
    expect(deletedUser).toBeNull();

    request(app.getHttpServer())
      .get(`/users/${user.id}`)
      .expect(404);
  });

  afterAll(async () => {
    await app.close();
  });
});
