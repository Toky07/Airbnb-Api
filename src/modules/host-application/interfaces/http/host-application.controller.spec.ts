import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EmailOrmEntity } from '@src/modules/mail/infrastructure/entities/email.orm-entity';
import { HOST_APPLICATION_STATUS } from '@src/modules/host-application/domain/constants/host-application-status.constant';
import {
  registerAndLoginAsSuperAdmin,
  registerAndLoginAsTraveler,
} from '@src/test/controller-test.helpers';
import { setupE2eApp } from '@src/test/e2e-app';

const payload = {
  city: 'Paris',
  propertyName: 'Maison Léa',
  message:
    'Je souhaite proposer un appartement lumineux dans le 11e arrondissement.',
};

describe('HostApplicationController', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    process.env.MAIL_TRANSPORT = 'console';
    process.env.HOST_APPLICATION_NOTIFY_EMAIL = 'ops@airbnb.dev';
    const ctx = await setupE2eApp();
    app = ctx.app;
    dataSource = ctx.dataSource;
  });

  it('permet à un voyageur de déposer une demande et au superadmin de l’approuver', async () => {
    const travelerToken = await registerAndLoginAsTraveler(app, dataSource, {
      email: 'lea-host@test.com',
      password: '123456',
      firstName: 'Léa',
      lastName: 'Martin',
      phoneNumber: '+33601020311',
    });
    const adminToken = await registerAndLoginAsSuperAdmin(app, dataSource, {
      email: 'admin-hosts@test.com',
      password: '123456',
      firstName: 'Admin',
      lastName: 'Hosts',
      phoneNumber: '+33601020312',
    });

    const created = await request(app.getHttpServer())
      .post('/host-applications')
      .set('Authorization', `Bearer ${travelerToken}`)
      .send(payload)
      .expect(201);

    expect(created.body).toEqual(
      expect.objectContaining({
        city: 'Paris',
        status: HOST_APPLICATION_STATUS.PENDING,
        propertyName: 'Maison Léa',
      }),
    );

    await request(app.getHttpServer())
      .post('/host-applications')
      .set('Authorization', `Bearer ${travelerToken}`)
      .send(payload)
      .expect(409);

    const mine = await request(app.getHttpServer())
      .get('/host-applications/me')
      .set('Authorization', `Bearer ${travelerToken}`)
      .expect(200);

    expect(mine.body.id).toBe(created.body.id);

    const listed = await request(app.getHttpServer())
      .get('/host-applications?status=pending')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(listed.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: created.body.id, status: 'pending' }),
      ]),
    );

    const reviewed = await request(app.getHttpServer())
      .patch(`/host-applications/${created.body.id}/review`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: HOST_APPLICATION_STATUS.APPROVED, comment: 'Bienvenue' })
      .expect(200);

    expect(reviewed.body.status).toBe(HOST_APPLICATION_STATUS.APPROVED);

    const hosts = await request(app.getHttpServer())
      .get('/host-applications/hosts')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(hosts.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ email: 'lea-host@test.com' }),
      ]),
    );

    const emails = await dataSource.getRepository(EmailOrmEntity).find();
    expect(emails.some((email) => email.to.includes('lea-host@test.com'))).toBe(
      true,
    );
    expect(emails.some((email) => email.to.includes('ops@airbnb.dev'))).toBe(
      true,
    );
  });

  it('interdit à un voyageur de modérer une demande', async () => {
    const travelerToken = await registerAndLoginAsTraveler(app, dataSource, {
      email: 'guest-moderation@test.com',
      password: '123456',
      firstName: 'Guest',
      lastName: 'Moderation',
      phoneNumber: '+33601020313',
    });

    await request(app.getHttpServer())
      .get('/host-applications')
      .set('Authorization', `Bearer ${travelerToken}`)
      .expect(403);

    await request(app.getHttpServer())
      .patch('/host-applications/1/review')
      .set('Authorization', `Bearer ${travelerToken}`)
      .send({
        status: HOST_APPLICATION_STATUS.REJECTED,
        comment: 'Dossier incomplet pour le moment.',
      })
      .expect(403);
  });
});
