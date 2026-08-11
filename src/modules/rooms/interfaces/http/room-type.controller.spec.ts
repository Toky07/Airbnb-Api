import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { JwtModule } from '@nestjs/jwt';
import { RoomsModule } from '@src/modules/rooms/room.module';
import { AuthModule } from '@src/modules/authentication/auth.module';
import { UserModule } from '@src/modules/user/user.module';
import { RoomTypeEntity } from '@src/modules/rooms/infrastructure/entities/room-type.entity';
import {
  AUTH_TEST_ENTITIES,
  DOMAIN_TEST_ENTITIES,
  registerAndLoginAsHost,
  registerAndLoginAsSuperAdmin,
} from '@src/test/controller-test.helpers';
import {
  getIntegrationTestDatabaseConfig,
  prepareIntegrationTestDatabase,
} from '@src/test/test-database.config';

describe('RoomTypeController', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let token: string;
  let hostToken: string;
  let createdTypeId: number;

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
        AuthModule,
        UserModule,
        RoomsModule,
      ],
    }).compile();

    dataSource = moduleRef.get(DataSource);
    app = moduleRef.createNestApplication();
    await app.init();

    token = await registerAndLoginAsSuperAdmin(app, dataSource);
    hostToken = await registerAndLoginAsHost(app, dataSource, {
      email: 'room-type-host@test.com',
      password: '123456',
      firstName: 'Room',
      lastName: 'Host',
      phoneNumber: '+33601020306',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /room-types lists all room types for super admin', async () => {
    const response = await request(app.getHttpServer())
      .get('/room-types')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.length).toBeGreaterThanOrEqual(7);
    expect(response.body[0]).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: expect.any(String),
        slug: expect.any(String),
        sortOrder: expect.any(Number),
        isActive: expect.any(Boolean),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
    );
  });

  it('GET /room-types/options returns active room types', async () => {
    const response = await request(app.getHttpServer())
      .get('/room-types/options')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.length).toBeGreaterThanOrEqual(7);
    expect(
      response.body.every((item: { isActive: boolean }) => item.isActive),
    ).toBe(true);
  });

  it('GET /room-types/options is public for search filters', async () => {
    await request(app.getHttpServer()).get('/room-types/options').expect(200);
    await request(app.getHttpServer())
      .get('/room-types/options')
      .set('Authorization', `Bearer ${hostToken}`)
      .expect(200);
  });

  it('GET /room-types rejects non super admin users', async () => {
    await request(app.getHttpServer())
      .get('/room-types')
      .set('Authorization', `Bearer ${hostToken}`)
      .expect(403);
  });

  it('POST /room-types rejects non super admin users', async () => {
    await request(app.getHttpServer())
      .post('/room-types')
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ name: 'Forbidden Room Type' })
      .expect(403);
  });

  it('POST /room-types creates a room type', async () => {
    const response = await request(app.getHttpServer())
      .post('/room-types')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Penthouse Suite',
        sortOrder: 99,
        isActive: true,
      })
      .expect(201);

    createdTypeId = response.body.id;
    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: 'Penthouse Suite',
        slug: 'penthouse-suite',
        sortOrder: 99,
        isActive: true,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
    );
  });

  it('PUT /room-types/:id updates a room type', async () => {
    const response = await request(app.getHttpServer())
      .put(`/room-types/${createdTypeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Penthouse Deluxe',
        sortOrder: 100,
        isActive: false,
      })
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: createdTypeId,
        name: 'Penthouse Deluxe',
        slug: 'penthouse-deluxe',
        sortOrder: 100,
        isActive: false,
      }),
    );

    const updated = await dataSource
      .getRepository(RoomTypeEntity)
      .findOne({ where: { id: createdTypeId } });
    expect(updated?.name).toBe('Penthouse Deluxe');
    expect(updated?.isActive).toBe(false);
  });

  it('DELETE /room-types/:id removes an unused room type', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/room-types')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'To Delete Room Type' })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/room-types/${createResponse.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const deleted = await dataSource
      .getRepository(RoomTypeEntity)
      .findOne({ where: { id: createResponse.body.id } });
    expect(deleted).toBeNull();
  });
});
