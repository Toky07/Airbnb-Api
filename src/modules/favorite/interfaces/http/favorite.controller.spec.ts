import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { AuthModule } from '@src/modules/authentication/auth.module';
import { UserModule } from '@src/modules/user/user.module';
import { PropertiesModule } from '@src/modules/properties/properties.module';
import { RoomsModule } from '@src/modules/rooms/room.module';
import { MediaModule } from '@src/modules/media/media.module';
import { FavoriteModule } from '@src/modules/favorite/favorite.module';
import { PropertyEntity } from '@src/modules/properties/infrastructure/entities/property-entity.entity';
import { RoomEntity } from '@src/modules/rooms/infrastructure/entities/room.entity';
import { FavoriteOrmEntity } from '@src/modules/favorite/infrastructure/entities/favorite.orm-entity';
import { UserEntity } from '@src/modules/user/infrastructure/entities/user.entity';
import {
  AUTH_TEST_ENTITIES,
  DEFAULT_REGISTER,
  DOMAIN_TEST_ENTITIES,
  registerAndLoginAsSuperAdmin,
} from '@src/test/controller-test.helpers';
import {
  getIntegrationTestDatabaseConfig,
  prepareIntegrationTestDatabase,
} from '@src/test/test-database.config';

describe('FavoriteController', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let token: string;
  let roomId: number;

  beforeAll(async () => {
    process.env.MAIL_TRANSPORT = 'console';
    await prepareIntegrationTestDatabase();

    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(
          getIntegrationTestDatabaseConfig([
            ...AUTH_TEST_ENTITIES,
            ...DOMAIN_TEST_ENTITIES,
            FavoriteOrmEntity,
          ]),
        ),
        JwtModule.register({
          global: true,
          secret: '1234',
          signOptions: { expiresIn: '5h' },
        }),
        AuthModule,
        UserModule,
        PropertiesModule,
        RoomsModule,
        MediaModule,
        FavoriteModule,
      ],
    }).compile();

    dataSource = moduleRef.get(DataSource);
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    token = await registerAndLoginAsSuperAdmin(app, dataSource);

    const user = await dataSource.getRepository(UserEntity).findOneBy({
      email: DEFAULT_REGISTER.email,
    });

    const property = await dataSource.getRepository(PropertyEntity).save({
      name: 'Hotel Favoris',
      description: 'Description',
      address: '1 rue Test',
      city: 'Paris',
      country: 'France',
      latitude: 0,
      longitude: 0,
      checkInTime: '15:00',
      checkOutTime: '11:00',
      ownerId: user!.id,
    });

    const room = await dataSource.getRepository(RoomEntity).save({
      name: 'Suite Favoris',
      description: 'Grande suite',
      pricePerNight: 100,
      maxGuests: 2,
      bedrooms: 1,
      bathrooms: 1,
      beds: 1,
      quantity: 1,
      size: 30,
      status: 'available',
      propertyId: property.id,
      slug: 'suite-favoris',
    });

    roomId = room.id;
  });

  afterAll(async () => {
    await app?.close();
  });

  it('POST /favorites ajoute un favori', async () => {
    const response = await request(app.getHttpServer())
      .post('/favorites')
      .set('Authorization', `Bearer ${token}`)
      .send({ roomId })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        roomId,
        createdAt: expect.any(String),
        room: expect.objectContaining({
          id: roomId,
          name: 'Suite Favoris',
        }),
      }),
    );
  });

  it('GET /favorites/me liste les favoris', async () => {
    const response = await request(app.getHttpServer())
      .get('/favorites/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          roomId,
          room: expect.objectContaining({ id: roomId }),
        }),
      ]),
    );
  });

  it('GET /favorites/check retourne le statut par chambre', async () => {
    const response = await request(app.getHttpServer())
      .get(`/favorites/check?roomIds=${roomId},999`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.favorites).toEqual({
      [String(roomId)]: true,
      '999': false,
    });
  });

  it('DELETE /favorites/:roomId supprime un favori', async () => {
    await request(app.getHttpServer())
      .delete(`/favorites/${roomId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const list = await request(app.getHttpServer())
      .get('/favorites/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(list.body).toEqual([]);
  });

  it('refuse les requêtes non authentifiées', async () => {
    await request(app.getHttpServer()).get('/favorites/me').expect(401);
  });
});
