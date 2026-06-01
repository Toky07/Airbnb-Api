import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth.module';
import { AuthEntity } from '../../infrastructure/entity/auth.entity';
import { Role } from '../../infrastructure/entity/role.entity';
import { DataSource } from 'typeorm';
import { UserNameVO } from '../../../user/domain/valueObject/username.vo';
import { RoleEntity } from '../../domain/entities/role.entity';
import { RoleMapper } from '../../infrastructure/mappers/role.mappers';

describe('Roles', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  const createRole = async (name: string) => {
    const repository = dataSource.getRepository(Role);
    repository.clear();
    
    return await repository.save(repository.create(
        RoleMapper.toEntity(new RoleEntity(new UserNameVO(name)))
    ));
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [AuthEntity, Role],
          synchronize: true,
        }),
        AuthModule,
      ],
    }).compile();

    dataSource = moduleRef.get(DataSource);
    app = moduleRef.createNestApplication();
    await app.init();
  });

  it(`/POST auth/roles`, async () => {    
    const response = await request(app.getHttpServer())
      .post('/auth/roles')
      .send({ name: 'test' })
      .expect(201);

    expect(response.body).toStrictEqual({
        id: expect.any(Number),
        name: 'test',
    });
  });

  it(`/GET auth/roles`, async () => {
    const repository = dataSource.getRepository(Role);
    repository.clear();
    
    await createRole('test');

    const response = await request(app.getHttpServer())
      .get('/auth/roles')
      .expect(200);

    expect(response.body).toStrictEqual([
      { id: expect.any(Number), name: 'test' },
    ]);
  });

  it(`PUT auth/roles/:id`, async () => {
    const repository = dataSource.getRepository(Role);
    repository.clear();
    
    const role = await createRole('test');

    const response = await request(app.getHttpServer())
      .put(`/auth/roles/${role.id}`)
      .send({ name: 'update'})
      .expect(200);

      expect(response.body).toStrictEqual({ id: expect.any(Number), name: 'update' });
  });

  it(`DELETE auth/roles/:id`, async () => {
    const repository = dataSource.getRepository(Role);
    repository.clear();
    
    const role = await createRole('test');

    await request(app.getHttpServer())
      .delete(`/auth/roles/${role.id}`)
      .expect(200);

    const expectedRole = await dataSource.getRepository(Role).findOne({ where: { id: role.id } });
    expect(expectedRole).toBeNull();
  });

});
