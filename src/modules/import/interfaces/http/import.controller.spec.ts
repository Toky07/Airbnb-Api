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
import {
  getIntegrationTestDatabaseConfig,
  prepareIntegrationTestDatabase,
} from '../../../../test/test-database.config';

describe('ImportController', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let token: string;

  beforeAll(async () => {
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

  it('POST /import crée un établissement pour un propriétaire importé', async () => {
    const ownerEmail = 'owner-import@test.com';

    const usersResponse = await request(app.getHttpServer())
      .post('/import')
      .set('Authorization', `Bearer ${token}`)
      .send({
        users: [
          {
            firstName: 'Owner',
            lastName: 'Import',
            email: ownerEmail,
            phoneNumber: '+33601010199',
          },
        ],
      })
      .expect(201);

    expect(usersResponse.body.created.users).toBe(1);

    const propertiesResponse = await request(app.getHttpServer())
      .post('/import')
      .set('Authorization', `Bearer ${token}`)
      .send({
        properties: [
          {
            name: 'Hôtel Import Test',
            description: 'Description assez longue pour valider l’import.',
            address: '1 rue Test',
            city: 'Nice',
            country: 'France',
            latitude: 43.7,
            longitude: 7.2,
            checkInTime: '15:00',
            checkOutTime: '11:00',
            ownerEmail,
          },
        ],
      })
      .expect(201);

    expect(propertiesResponse.body.created.properties).toBe(1);
    expect(propertiesResponse.body.errors).toEqual([]);
  });
});
