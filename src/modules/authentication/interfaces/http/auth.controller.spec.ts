import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AuthModule } from '../../auth.module';
import { AuthEntity } from '../../infrastructure/entity/auth.entity';
import * as bcrypt from 'bcrypt';
import { EmailVO } from '../../../../shared/valueObject/email.vo';
import { Auth } from '../../domain/entities/user.entity';
import { Role } from '../../infrastructure/entity/role.entity';
import { UserNameVO } from '../../../user/domain/valueObject/username.vo';
import { RoleEntity } from '../../domain/entities/role.entity';
import { RoleMapper } from '../../infrastructure/mappers/role.mappers';

describe('Auth', () => {
  let app: INestApplication;
  let dataSource: DataSource;

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

  beforeEach(async () => {
    const repository = dataSource.getRepository(AuthEntity);
    await repository.clear();
  });

  it(`/POST auth/register`, async () => {
    const repository = dataSource.getRepository(AuthEntity);
    const data = {
        email: 'test@test.com',
        password: 'password',
      };
    
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(data)
      .expect(201);

    expect(response.body).toStrictEqual({ success: true });

    const auth = await repository.findOne({ where: { email: data.email } });
    expect(auth).toBeDefined();
    expect(await bcrypt.compare(data.password, auth?.password)).toBe(true);
  });

  it(`/POST auth/login login with valid credentials`, async () => {
    const repository = dataSource.getRepository(AuthEntity);
    const data = {
      email: 'test@test.com',
      password: 'password',
    };

    const created = repository.create(new Auth(new EmailVO(data.email), await bcrypt.hash(data.password, 10)));
    
    await repository.save(created);

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(data)
      .expect(200);

    expect(response.body).toStrictEqual({ token: expect.any(String) });
  });

  it(`/POST auth/login login with invalid credentials`, async () => {
    const repository = dataSource.getRepository(AuthEntity);
    const data = {
      email: 'test@test.com',
      password: 'password',
    };
    
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(data)
      .expect(401);
  });

  it(`/POST auth/assign-role`, async () => {
    const userRepository = dataSource.getRepository(AuthEntity);
    const roleRepository = dataSource.getRepository(Role);
    const user = await userRepository.save(
      userRepository.create(new Auth(new EmailVO('test@example.com'), await bcrypt.hash('password', 10)))
    );
  
    const role = await roleRepository.save(
      roleRepository.create(RoleMapper.toEntity(new RoleEntity(new UserNameVO('test'))))
    );
    
    const data = {
      userId: user.id,
      roleId: [role.id!],
    };
    
    const response = await request(app.getHttpServer())
      .post('/auth/assign-role')
      .send(data)
      .expect(200);

    expect(response.body).toStrictEqual({ success: true });
  });

  afterAll(async () => {
    await app.close();
  });
});
