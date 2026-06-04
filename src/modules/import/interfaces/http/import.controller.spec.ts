import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportModule } from '../../import.module';
import { UserEntity } from '../../../user/infrastructure/entities/user.entity';
import { PropertyEntity } from '../../../properties/infrastructure/entities/property-entity.entity';
import { RoomEntity } from '../../../rooms/infrastructure/entities/room.entity';
import { MediaOrmEntity } from '../../../media/infrastructure/entities/media-orm.entity';

describe('ImportController', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          synchronize: true,
          entities: [UserEntity, PropertyEntity, RoomEntity, MediaOrmEntity],
        }),
        ImportModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /import répond 201 avec un lot vide', async () => {
    const response = await request(app.getHttpServer())
      .post('/import')
      .send({ users: [], properties: [], rooms: [] })
      .expect(201);

    expect(response.body.created).toEqual({
      users: 0,
      properties: 0,
      rooms: 0,
    });
    expect(response.body.errors).toEqual([]);
  });
});
