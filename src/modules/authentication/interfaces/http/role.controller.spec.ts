import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '@src/modules/authentication/auth.module';
import { MailModule } from '@src/modules/mail/mail.module';
import { UserModule } from '@src/modules/user/user.module';
import { AuthEntity } from '@src/modules/authentication/infrastructure/entity/auth.entity';
import { Role } from '@src/modules/authentication/infrastructure/entity/role.entity';
import { DataSource } from 'typeorm';
import { UserNameVO } from '@src/modules/user/contracts';
import { RoleEntity } from '@src/modules/authentication/domain/entities/role.entity';
import { RoleMapper } from '@src/modules/authentication/infrastructure/mappers/role.mappers';
import { PermissionEntity } from '@src/modules/authentication/infrastructure/entity/permission.entity';
import {
  AUTH_TEST_ENTITIES,
  DOMAIN_TEST_ENTITIES,
  registerAndLoginAsSuperAdmin,
} from '@src/test/controller-test.helpers';
import {
  getIntegrationTestDatabaseConfig,
  prepareIntegrationTestDatabase,
} from '@src/test/test-database.config';

describe('Roles', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let token: string;

  const createRole = async (name: string, slug = 'test-role') => {
    const repository = dataSource.getRepository(Role);
    await repository.delete({ slug });

    return repository.save(
      repository.create(
        RoleMapper.toEntity(new RoleEntity(new UserNameVO(name), slug)),
      ),
    );
  };

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
        MailModule,
        UserModule,
        AuthModule,
      ],
    }).compile();

    dataSource = moduleRef.get(DataSource);
    app = moduleRef.createNestApplication();
    await app.init();
    token = await registerAndLoginAsSuperAdmin(app, dataSource);
  });

  it(`/POST auth/roles`, async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/roles')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'test' })
      .expect(201);

    expect(response.body).toStrictEqual({
      id: expect.any(Number),
      name: 'test',
      slug: 'test',
      description: null,
      permissionKeys: [],
      isSystem: false,
    });
  });

  it(`/GET auth/roles`, async () => {
    await createRole('test');

    const response = await request(app.getHttpServer())
      .get('/auth/roles')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.data).toEqual(
      expect.arrayContaining([
        {
          id: expect.any(Number),
          name: 'test',
          slug: 'test-role',
          description: null,
          permissionKeys: [],
          isSystem: false,
        },
      ]),
    );
  });

  it(`PUT auth/roles/:id`, async () => {
    const role = await createRole('test');

    const response = await request(app.getHttpServer())
      .put(`/auth/roles/${role.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'update' })
      .expect(200);

    expect(response.body).toStrictEqual({
      id: expect.any(Number),
      name: 'update',
      slug: 'test-role',
      description: null,
      permissionKeys: [],
      isSystem: false,
    });
  });

  it(`DELETE auth/roles/:id`, async () => {
    const role = await createRole('test');

    await request(app.getHttpServer())
      .delete(`/auth/roles/${role.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const expectedRole = await dataSource
      .getRepository(Role)
      .findOne({ where: { id: role.id } });
    expect(expectedRole).toBeNull();
  });
});
