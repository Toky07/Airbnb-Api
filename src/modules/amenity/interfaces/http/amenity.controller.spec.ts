import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../../../authentication/auth.module';
import { UserModule } from '../../../user/user.module';
import { PropertiesModule } from '../../../properties/properties.module';
import { RoomsModule } from '../../../rooms/room.module';
import { AmenityModule } from '../../amenity.module';
import { AMENITY_SCOPE } from '../../domain/constants/amenity-scope.constant';
import { PropertyEntity } from '../../../properties/infrastructure/entities/property-entity.entity';
import { RoomEntity } from '../../../rooms/infrastructure/entities/room.entity';
import { AmenityOrmEntity } from '../../infrastructure/entities/amenity.orm-entity';
import {
  AUTH_TEST_ENTITIES,
  DOMAIN_TEST_ENTITIES,
  registerAndLoginAsSuperAdmin,
} from '../../../../test/controller-test.helpers';

describe('AmenityController', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let token: string;

  const defaultProperty = {
    name: 'Test Property',
    description: 'Test Description',
    address: 'Test Address',
    city: 'Test City',
    country: 'Test Country',
    latitude: 0,
    longitude: 0,
    checkInTime: '14:00',
    checkOutTime: '11:00',
    ownerId: 1,
  } as const;

  const defaultRoom = {
    name: 'Test Room',
    slug: 'test-room',
    description: 'Test Description',
    pricePerNight: 100,
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    beds: 2,
    quantity: 1,
    size: 100,
    status: 'active',
  } as const;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [...AUTH_TEST_ENTITIES, ...DOMAIN_TEST_ENTITIES],
          synchronize: true,
        }),
        JwtModule.register({
          global: true,
          secret: '1234',
          secret: '1234',
          signOptions: { expiresIn: '5h' },
        }),
        AuthModule,
        UserModule,
        PropertiesModule,
        RoomsModule,
        AmenityModule,
      ],
    }).compile();

    dataSource = moduleRef.get(DataSource);
    app = moduleRef.createNestApplication();
    await app.init();

    token = await registerAndLoginAsSuperAdmin(app, dataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /amenities creates a room amenity', async () => {
    const response = await request(app.getHttpServer())
      .post('/amenities')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Kitchenette',
        icon: 'kitchen-set',
        scope: AMENITY_SCOPE.ROOM,
      })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: 'Kitchenette',
        icon: 'kitchen-set',
        scope: AMENITY_SCOPE.ROOM,
        isActive: true,
      }),
    );
  });

  it('GET /amenities?scope=property lists property amenities only', async () => {
    const amenityRepo = dataSource.getRepository(AmenityOrmEntity);
    await amenityRepo.save({
      name: 'Ascenseur',
      icon: 'elevator',
      scope: AMENITY_SCOPE.PROPERTY,
      isActive: true,
    });
    await amenityRepo.save({
      name: 'TV test',
      icon: 'tv',
      scope: AMENITY_SCOPE.ROOM,
      isActive: true,
    });

    const response = await request(app.getHttpServer())
      .get('/amenities')
      .query({ scope: AMENITY_SCOPE.PROPERTY })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(
      response.body.some((item: { name: string }) => item.name === 'Ascenseur'),
    ).toBe(true);
    expect(
      response.body.every(
        (item: { scope: string }) => item.scope === AMENITY_SCOPE.PROPERTY,
      ),
    ).toBe(true);
  });

  it('PUT /amenities/properties/:propertyId syncs property amenities', async () => {
    const propertyRepo = dataSource.getRepository(PropertyEntity);
    const amenityRepo = dataSource.getRepository(AmenityOrmEntity);

    const property = await propertyRepo.save({ ...defaultProperty });
    const wifi = await amenityRepo.save({
      name: 'WiFi Sync',
      icon: 'wifi',
      scope: AMENITY_SCOPE.PROPERTY,
      isActive: true,
    });
    const parking = await amenityRepo.save({
      name: 'Parking Sync',
      icon: 'square-parking',
      scope: AMENITY_SCOPE.PROPERTY,
      isActive: true,
    });

    const response = await request(app.getHttpServer())
      .put(`/amenities/properties/${property.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ amenityIds: [wifi.id, parking.id] })
      .expect(200);

    expect(response.body).toHaveLength(2);
  });

  it('PUT /amenities/rooms/:roomId syncs room amenities', async () => {
    const propertyRepo = dataSource.getRepository(PropertyEntity);
    const roomRepo = dataSource.getRepository(RoomEntity);
    const amenityRepo = dataSource.getRepository(AmenityOrmEntity);

    const property = await propertyRepo.save({ ...defaultProperty });
    const room = await roomRepo.save({
      ...defaultRoom,
      slug: 'room-amenity-test',
      property,
    });
    const tv = await amenityRepo.save({
      name: 'TV Sync',
      icon: 'tv',
      scope: AMENITY_SCOPE.ROOM,
      isActive: true,
    });

    const response = await request(app.getHttpServer())
      .put(`/amenities/rooms/${room.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ amenityIds: [tv.id] })
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].name).toBe('TV Sync');
  });

  it('DELETE /amenities/:id removes an unused amenity', async () => {
    const amenityRepo = dataSource.getRepository(AmenityOrmEntity);
    const amenity = await amenityRepo.save({
      name: 'À supprimer',
      icon: 'trash',
      scope: AMENITY_SCOPE.ROOM,
      isActive: true,
    });

    await request(app.getHttpServer())
      .delete(`/amenities/${amenity.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const deleted = await amenityRepo.findOne({ where: { id: amenity.id } });
    expect(deleted).toBeNull();
  });
});
