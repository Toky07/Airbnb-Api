import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PropertyTypeEntity } from '@src/modules/properties/infrastructure/entities/property-type.entity';
import {
  registerAndLoginAsHost,
  registerAndLoginAsSuperAdmin,
} from '@src/test/controller-test.helpers';
import { setupE2eApp } from '@src/test/e2e-app';

describe('PropertyTypeController', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let token: string;
  let hostToken: string;
  let createdTypeId: number;

  beforeAll(async () => {
    process.env.MAIL_TRANSPORT = 'console';
    const ctx = await setupE2eApp();
    app = ctx.app;
    dataSource = ctx.dataSource;

    token = await registerAndLoginAsSuperAdmin(app, dataSource);
    hostToken = await registerAndLoginAsHost(app, dataSource, {
      email: 'property-type-host@test.com',
      password: '123456',
      firstName: 'Property',
      lastName: 'Host',
      phoneNumber: '+33601020305',
    });
  });

  it('GET /property-types lists all property types for super admin', async () => {
    const response = await request(app.getHttpServer())
      .get('/property-types')
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

  it('GET /property-types/options returns active property types', async () => {
    const response = await request(app.getHttpServer())
      .get('/property-types/options')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.length).toBeGreaterThanOrEqual(7);
    expect(
      response.body.every((item: { isActive: boolean }) => item.isActive),
    ).toBe(true);
  });

  it('GET /property-types/options rejects host without properties.read', async () => {
    await request(app.getHttpServer())
      .get('/property-types/options')
      .set('Authorization', `Bearer ${hostToken}`)
      .expect(403);
  });

  it('GET /property-types rejects non super admin users', async () => {
    await request(app.getHttpServer())
      .get('/property-types')
      .set('Authorization', `Bearer ${hostToken}`)
      .expect(403);
  });

  it('POST /property-types rejects non super admin users', async () => {
    await request(app.getHttpServer())
      .post('/property-types')
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ name: 'Forbidden Type' })
      .expect(403);
  });

  it('GET /property-types/options rejects unauthenticated requests', async () => {
    await request(app.getHttpServer())
      .get('/property-types/options')
      .expect(401);
  });

  it('POST /property-types creates a property type', async () => {
    const response = await request(app.getHttpServer())
      .post('/property-types')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Boutique Hotel',
        sortOrder: 99,
        isActive: true,
      })
      .expect(201);

    createdTypeId = response.body.id;
    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: 'Boutique Hotel',
        slug: 'boutique-hotel',
        sortOrder: 99,
        isActive: true,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
    );
  });

  it('PUT /property-types/:id updates a property type', async () => {
    const response = await request(app.getHttpServer())
      .put(`/property-types/${createdTypeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Boutique Resort',
        sortOrder: 100,
        isActive: false,
      })
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: createdTypeId,
        name: 'Boutique Resort',
        slug: 'boutique-resort',
        sortOrder: 100,
        isActive: false,
      }),
    );

    const updated = await dataSource
      .getRepository(PropertyTypeEntity)
      .findOne({ where: { id: createdTypeId } });
    expect(updated?.name).toBe('Boutique Resort');
    expect(updated?.isActive).toBe(false);
  });

  it('DELETE /property-types/:id removes an unused property type', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/property-types')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'To Delete Type' })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/property-types/${createResponse.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const deleted = await dataSource
      .getRepository(PropertyTypeEntity)
      .findOne({ where: { id: createResponse.body.id } });
    expect(deleted).toBeNull();
  });
});
