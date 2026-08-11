import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { AuthModule } from '../../../authentication/auth.module';
import { UserModule } from '../../../user/user.module';
import { MailModule } from '../../mail.module';
import { EmailOrmEntity } from '../../infrastructure/entities/email.orm-entity';
import { AuthEntity } from '../../../authentication/infrastructure/entity/auth.entity';
import { Role } from '../../../authentication/infrastructure/entity/role.entity';
import { PermissionEntity } from '../../../authentication/infrastructure/entity/permission.entity';
import { UserEntity } from '../../../user/infrastructure/entities/user.entity';
import { HOST_ROLE_SLUG } from '../../../authentication/contracts';
import { MediaOrmEntity } from '../../../media/infrastructure/entities/media-orm.entity';
import { MediaModule } from '../../../media/media.module';
import {
  AUTH_TEST_ENTITIES,
  assignHostRole,
  clearEntitiesForTests,
  DOMAIN_TEST_ENTITIES,
  activateAuthAccountForTests,
} from '../../../../test/controller-test.helpers';
import {
  getIntegrationTestDatabaseConfig,
  prepareIntegrationTestDatabase,
} from '../../../../test/test-database.config';

describe('MailController', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let hostToken: string;
  let previousMailTransport: string | undefined;

  beforeAll(async () => {
    previousMailTransport = process.env.MAIL_TRANSPORT;
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
        MediaModule,
        MailModule,
      ],
    }).compile();

    dataSource = moduleRef.get(DataSource);
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'mail-host@test.com',
        firstName: 'Mail',
        lastName: 'Host',
        phoneNumber: '+33601020304',
      })
      .expect(201);

    await activateAuthAccountForTests(
      dataSource,
      'mail-host@test.com',
      '123456',
    );

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'mail-host@test.com', password: '123456' });

    hostToken = login.body.token;
  });

  afterAll(async () => {
    if (previousMailTransport === undefined) {
      delete process.env.MAIL_TRANSPORT;
    } else {
      process.env.MAIL_TRANSPORT = previousMailTransport;
    }
    await app?.close();
  });

  beforeEach(async () => {
    await clearEntitiesForTests(dataSource, [EmailOrmEntity]);
  });

  async function grantHostEmailPermissions(): Promise<string> {
    const permissionRepo = dataSource.getRepository(PermissionEntity);
    const roleRepo = dataSource.getRepository(Role);
    const readPermission = await permissionRepo.findOne({
      where: { key: 'emails.read' },
    });
    const sendPermission = await permissionRepo.findOne({
      where: { key: 'emails.send' },
    });
    const hostRole = await roleRepo.findOne({
      where: { slug: HOST_ROLE_SLUG },
      relations: ['permissions'],
    });

    if (hostRole && readPermission && sendPermission) {
      const keys = new Set(
        (hostRole.permissions ?? []).map((permission) => permission.key),
      );
      hostRole.permissions = [
        ...(hostRole.permissions ?? []),
        ...(keys.has('emails.read') ? [] : [readPermission]),
        ...(keys.has('emails.send') ? [] : [sendPermission]),
      ];
      await roleRepo.save(hostRole);
    }

    await assignHostRole(dataSource, 'mail-host@test.com');

    const relogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'mail-host@test.com', password: '123456' });

    return relogin.body.token;
  }

  it('refuse l’envoi sans permission emails.send', async () => {
    await request(app.getHttpServer())
      .post('/emails/send')
      .set('Authorization', `Bearer ${hostToken}`)
      .field('to', 'guest@test.com')
      .field('subject', 'Test')
      .field('body', 'Hello')
      .expect(403);
  });

  it('envoie et liste les emails avec les permissions', async () => {
    const token = await grantHostEmailPermissions();

    await request(app.getHttpServer())
      .post('/emails/send')
      .set('Authorization', `Bearer ${token}`)
      .field('to', 'guest@test.com')
      .field('subject', 'Bonjour')
      .field('body', 'Message test')
      .expect(201);

    const list = await request(app.getHttpServer())
      .get('/emails')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(list.body.data.length).toBe(1);
    expect(list.body.data[0].subject).toBe('Bonjour');
  });
});
