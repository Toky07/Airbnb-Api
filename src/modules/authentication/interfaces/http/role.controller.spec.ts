import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Role } from '@src/modules/authentication/infrastructure/entity/role.entity';
import { DataSource } from 'typeorm';
import { UserNameVO } from '@src/modules/user/contracts';
import { RoleEntity } from '@src/modules/authentication/domain/entities/role.entity';
import { RoleMapper } from '@src/modules/authentication/infrastructure/mappers/role.mappers';
import { registerAndLoginAsSuperAdmin } from '@src/test/controller-test.helpers';
import { setupE2eApp } from '@src/test/e2e-app';

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
    const ctx = await setupE2eApp();
    app = ctx.app;
    dataSource = ctx.dataSource;
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
