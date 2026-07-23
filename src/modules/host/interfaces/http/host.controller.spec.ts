import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../../../authentication/auth.module';
import { UserModule } from '../../../user/user.module';
import { HostModule } from '../../host.module';
import { PropertyEntity } from '../../../properties/infrastructure/entities/property-entity.entity';
import { RoomEntity } from '../../../rooms/infrastructure/entities/room.entity';
import { AmenityOrmEntity } from '../../../amenity/infrastructure/entities/amenity.orm-entity';
import { AMENITY_SCOPE } from '../../../amenity/domain/constants/amenity-scope.constant';
import {
  AUTH_TEST_ENTITIES,
  DOMAIN_TEST_ENTITIES,
  registerAndLoginAsHost,
} from '../../../../test/controller-test.helpers';
import {
  getIntegrationTestDatabaseConfig,
  prepareIntegrationTestDatabase,
} from '../../../../test/test-database.config';

describe('HostController', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let token: string;
  let propertyId: number;
  let roomId: number;

  const defaultProperty = {
    name: 'Host Property',
    description: 'Host property description',
    address: '10 rue de Paris',
    city: 'Paris',
    country: 'France',
    latitude: 48.8566,
    longitude: 2.3522,
    checkInTime: '14:00',
    checkOutTime: '11:00',
  } as const;

  const defaultRoom = {
    name: 'Host Room',
    description: 'Host room description',
    pricePerNight: 120,
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    beds: 1,
    quantity: 1,
    size: 25,
    status: 'available',
  } as const;

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
        AuthModule,
        UserModule,
        HostModule,
      ],
    }).compile();

    dataSource = moduleRef.get(DataSource);
    app = moduleRef.createNestApplication();
    await app.init();

    token = await registerAndLoginAsHost(app, dataSource, {
      email: 'host-controller@test.com',
      password: '123456',
      firstName: 'Host',
      lastName: 'Controller',
      phoneNumber: '+33601020304',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /host/profile returns host profile', async () => {
    const response = await request(app.getHttpServer())
      .get('/host/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.user).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        firstName: 'Host',
        lastName: 'Controller',
        email: 'host-controller@test.com',
        phoneNumber: '+33601020304',
      }),
    );
    expect(response.body.properties).toEqual([]);
  });

  it('POST /host/properties creates an owned property', async () => {
    const response = await request(app.getHttpServer())
      .post('/host/properties')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...defaultProperty })
      .expect(201);

    propertyId = response.body.id;
    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        ...defaultProperty,
        image: null,
        propertyTypeId: null,
        rooms: [],
      }),
    );
  });

  it('GET /host/properties lists owned properties', async () => {
    const response = await request(app.getHttpServer())
      .get('/host/properties')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toEqual(
      expect.objectContaining({
        id: propertyId,
        name: defaultProperty.name,
      }),
    );
  });

  it('GET /host/properties/:id returns one owned property', async () => {
    const response = await request(app.getHttpServer())
      .get(`/host/properties/${propertyId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: propertyId,
        name: defaultProperty.name,
        rooms: [],
      }),
    );
  });

  it('PUT /host/properties/:id updates an owned property', async () => {
    const response = await request(app.getHttpServer())
      .put(`/host/properties/${propertyId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...defaultProperty,
        name: 'Updated Host Property',
      })
      .expect(200);

    expect(response.body.name).toBe('Updated Host Property');

    const updated = await dataSource
      .getRepository(PropertyEntity)
      .findOne({ where: { id: propertyId } });
    expect(updated?.name).toBe('Updated Host Property');
  });

  it('GET /host/property-types/options returns property type options', async () => {
    const response = await request(app.getHttpServer())
      .get('/host/property-types/options')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('GET /host/room-types/options returns room type options', async () => {
    const response = await request(app.getHttpServer())
      .get('/host/room-types/options')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('GET /host/amenities/property/options returns property amenity options', async () => {
    const response = await request(app.getHttpServer())
      .get('/host/amenities/property/options')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('GET /host/amenities/room/options returns room amenity options', async () => {
    const response = await request(app.getHttpServer())
      .get('/host/amenities/room/options')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('PUT /host/properties/:id/amenities syncs property amenities', async () => {
    const amenityRepo = dataSource.getRepository(AmenityOrmEntity);
    const wifi = await amenityRepo.save({
      name: 'Host WiFi',
      icon: 'wifi',
      scope: AMENITY_SCOPE.PROPERTY,
      isActive: true,
    });

    const response = await request(app.getHttpServer())
      .put(`/host/properties/${propertyId}/amenities`)
      .set('Authorization', `Bearer ${token}`)
      .send({ amenityIds: [wifi.id] })
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].name).toBe('Host WiFi');
  });

  it('GET /host/properties/:id/amenities returns synced property amenities', async () => {
    const response = await request(app.getHttpServer())
      .get(`/host/properties/${propertyId}/amenities`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].name).toBe('Host WiFi');
  });

  it('POST /host/rooms creates a room for an owned property', async () => {
    const response = await request(app.getHttpServer())
      .post('/host/rooms')
      .query({ propertyId })
      .set('Authorization', `Bearer ${token}`)
      .send({ ...defaultRoom })
      .expect(201);

    roomId = response.body.id;
    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        ...defaultRoom,
        images: [],
      }),
    );
  });

  it('GET /host/rooms lists rooms for an owned property', async () => {
    const response = await request(app.getHttpServer())
      .get('/host/rooms')
      .query({ propertyId })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toEqual(
      expect.objectContaining({
        id: roomId,
        name: defaultRoom.name,
      }),
    );
  });

  it('PUT /host/rooms/:id updates a room for an owned property', async () => {
    const response = await request(app.getHttpServer())
      .put(`/host/rooms/${roomId}`)
      .query({ propertyId })
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...defaultRoom,
        name: 'Updated Host Room',
      })
      .expect(200);

    expect(response.body.name).toBe('Updated Host Room');

    const updated = await dataSource
      .getRepository(RoomEntity)
      .findOne({ where: { id: roomId } });
    expect(updated?.name).toBe('Updated Host Room');
  });

  it('PUT /host/rooms/:id/amenities syncs room amenities', async () => {
    const amenityRepo = dataSource.getRepository(AmenityOrmEntity);
    const tv = await amenityRepo.save({
      name: 'Host TV',
      icon: 'tv',
      scope: AMENITY_SCOPE.ROOM,
      isActive: true,
    });

    const response = await request(app.getHttpServer())
      .put(`/host/rooms/${roomId}/amenities`)
      .query({ propertyId })
      .set('Authorization', `Bearer ${token}`)
      .send({ amenityIds: [tv.id] })
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].name).toBe('Host TV');
  });

  it('GET /host/rooms/:id/amenities returns synced room amenities', async () => {
    const response = await request(app.getHttpServer())
      .get(`/host/rooms/${roomId}/amenities`)
      .query({ propertyId })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].name).toBe('Host TV');
  });

  it('POST /host/rooms/:id/blocked-dates creates a blocked range', async () => {
    const response = await request(app.getHttpServer())
      .post(`/host/rooms/${roomId}/blocked-dates`)
      .query({ propertyId })
      .set('Authorization', `Bearer ${token}`)
      .send({
        startDate: '2026-11-01',
        endDate: '2026-11-05',
        reason: 'Travaux',
      })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        roomId,
        startDate: '2026-11-01',
        endDate: '2026-11-05',
        reason: 'Travaux',
      }),
    );
  });

  it('GET /host/rooms/:id/blocked-dates lists blocked ranges', async () => {
    const response = await request(app.getHttpServer())
      .get(`/host/rooms/${roomId}/blocked-dates`)
      .query({ propertyId })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.length).toBeGreaterThanOrEqual(1);
    expect(response.body[0]).toEqual(
      expect.objectContaining({
        roomId,
        startDate: '2026-11-01',
        endDate: '2026-11-05',
      }),
    );
  });

  it('DELETE /host/rooms/:id/blocked-dates/:blockedDateId removes a range', async () => {
    const listed = await request(app.getHttpServer())
      .get(`/host/rooms/${roomId}/blocked-dates`)
      .query({ propertyId })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const blockedDateId = listed.body[0].id as number;

    await request(app.getHttpServer())
      .delete(`/host/rooms/${roomId}/blocked-dates/${blockedDateId}`)
      .query({ propertyId })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const after = await request(app.getHttpServer())
      .get(`/host/rooms/${roomId}/blocked-dates`)
      .query({ propertyId })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(
      after.body.find((item: { id: number }) => item.id === blockedDateId),
    ).toBeUndefined();
  });

  it('POST /host/properties with image uploads property media', async () => {
    const response = await request(app.getHttpServer())
      .post('/host/properties')
      .set('Authorization', `Bearer ${token}`)
      .field('name', 'Property With Image')
      .field('description', defaultProperty.description)
      .field('address', defaultProperty.address)
      .field('city', defaultProperty.city)
      .field('country', defaultProperty.country)
      .field('latitude', String(defaultProperty.latitude))
      .field('longitude', String(defaultProperty.longitude))
      .field('checkInTime', defaultProperty.checkInTime)
      .field('checkOutTime', defaultProperty.checkOutTime)
      .attach('image', Buffer.from('host-property-image'), 'property.jpg')
      .expect(201);

    expect(response.body.image).toMatch(/uploads\/\d+\/property\/.+\.jpg$/);
    expect(response.body.name).toBe('Property With Image');
  });

  it('DELETE /host/rooms/:id deletes a room from an owned property', async () => {
    await request(app.getHttpServer())
      .delete(`/host/rooms/${roomId}`)
      .query({ propertyId })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const deleted = await dataSource
      .getRepository(RoomEntity)
      .findOne({ where: { id: roomId } });
    expect(deleted).toBeNull();
  });
});
