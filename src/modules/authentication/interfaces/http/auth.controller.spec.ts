import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AuthModule } from '../../auth.module';
import { AuthEntity } from '../../infrastructure/entity/auth.entity';
import * as bcrypt from 'bcrypt';
import { EmailVO } from '../../../../shared/valueObject/email.vo';
import { Auth } from '../../domain/entities/user.entity';

describe('Cats', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: 'test.sqlite',
          entities: [AuthEntity],
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
    const repository = dataSource.getRepository(AuthEntity);
    await repository.clear();
  });

  it(`/POST auth/create`, async () => {
    const repository = dataSource.getRepository(AuthEntity);
    const data = {
        email: 'test@test.com',
        password: 'password',
      };
    
    const response = await request(app.getHttpServer())
      .post('/auth/create')
      .send(data)
      .expect(201);

    expect(response.body).toStrictEqual({ success: true });

    const auth = await repository.findOne({ where: { email: data.email } });
    expect(auth).toBeDefined();
    expect(await bcrypt.compare(data.password, auth?.password)).toBe(true);
  });

  it.only(`/POST auth/login login with valid credentials`, async () => {
    const repository = dataSource.getRepository(AuthEntity);
    const data = {
      email: 'test@test.com',
      password: 'password',
    };

    const created = repository.create(new Auth(new EmailVO(data.email), await bcrypt.hash(data.password, 10)));
    
    await repository.save(created);

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(data)
      .expect(200);

    expect(response.body).toStrictEqual({ token: expect.any(String) });
  });

  afterAll(async () => {
    await app.close();
  });
});
