import { INestApplication } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AuthModule } from '../../../authentication/auth.module';
import { UserModule } from '../../../user/user.module';
import { ImportModule } from '../../import.module';
import {
  AUTH_TEST_ENTITIES,
  DOMAIN_TEST_ENTITIES,
  registerAndLoginAsSuperAdmin,
} from '../../../../test/controller-test.helpers';

describe('ImportController', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let token: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          synchronize: true,
          entities: [...AUTH_TEST_ENTITIES, ...DOMAIN_TEST_ENTITIES],
        }),
        JwtModule.register({
          global: true,
          secret: '1234',
          secretOrPrivateKey: '1234',
          signOptions: { expiresIn: '5h' },
        }),
        AuthModule,
        UserModule,
        ImportModule,
      ],
    }).compile();

    dataSource = moduleRef.get(DataSource);
    app = moduleRef.createNestApplication();
    await app.init();
    token = await registerAndLoginAsSuperAdmin(app, dataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /import répond 201 avec un lot vide', async () => {
    const response = await request(app.getHttpServer())
      .post('/import')
      .set('Authorization', `Bearer ${token}`)
      .send({ users: [], properties: [], rooms: [] })
      .expect(201);

    expect(response.body.created).toEqual({
      users: 0,
      properties: 0,
      rooms: 0,
      propertyTypes: 0,
      roomTypes: 0,
      roles: 0,
    });
    expect(response.body.errors).toEqual([]);
  });
});
