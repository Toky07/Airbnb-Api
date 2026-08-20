import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EmailOrmEntity } from '@src/modules/mail/infrastructure/entities/email.orm-entity';
import { clearEntitiesForTests } from '@src/test/controller-test.helpers';
import { setupE2eApp } from '@src/test/e2e-app';

describe('ContactController', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let previousSupportEmail: string | undefined;
  let previousMailTransport: string | undefined;

  beforeAll(async () => {
    previousSupportEmail = process.env.SUPPORT_EMAIL;
    previousMailTransport = process.env.MAIL_TRANSPORT;
    process.env.SUPPORT_EMAIL = 'support@airbnb.dev';
    process.env.MAIL_TRANSPORT = 'console';
    const ctx = await setupE2eApp();
    app = ctx.app;
    dataSource = ctx.dataSource;
  });

  afterAll(async () => {
    if (previousSupportEmail === undefined) {
      delete process.env.SUPPORT_EMAIL;
    } else {
      process.env.SUPPORT_EMAIL = previousSupportEmail;
    }
    if (previousMailTransport === undefined) {
      delete process.env.MAIL_TRANSPORT;
    } else {
      process.env.MAIL_TRANSPORT = previousMailTransport;
    }
  });

  beforeEach(async () => {
    await clearEntitiesForTests(dataSource, [EmailOrmEntity]);
  });

  it('accepte un message public et crée un email', async () => {
    await request(app.getHttpServer())
      .post('/contact')
      .send({
        name: 'Léa Martin',
        email: 'lea@test.com',
        subject: 'Question séjour',
        message: 'Bonjour, comment récupérer les clés ?',
      })
      .expect(201);

    const emails = await dataSource.getRepository(EmailOrmEntity).find();
    expect(emails).toHaveLength(1);
    expect(emails[0]?.to).toContain('support@airbnb.dev');
    expect(emails[0]?.subject).toBe('[Contact] Question séjour');
    expect(emails[0]?.sourceModule).toBe('contact');
  });

  it('valide le payload', async () => {
    await request(app.getHttpServer())
      .post('/contact')
      .send({
        name: 'L',
        email: 'not-an-email',
        subject: 'x',
        message: 'court',
      })
      .expect(400);
  });
});
