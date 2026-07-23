import request from 'supertest';
import { Test } from '@nestjs/testing';
import { RoomsModule } from '../../room.module';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { JwtModule } from '@nestjs/jwt';
import { RoomEntity } from '../../infrastructure/entities/room.entity';
import { RoomBlockedDateOrmEntity } from '../../infrastructure/entities/room-blocked-date.orm-entity';
import { RoomTypeEntity } from '../../infrastructure/entities/room-type.entity';
import { PropertyEntity } from '../../../properties/infrastructure/entities/property-entity.entity';
import { PropertyTypeEntity } from '../../../properties/infrastructure/entities/property-type.entity';
import { MediaOrmEntity } from '../../../media/infrastructure/entities/media-orm.entity';
import { AuthModule } from '../../../authentication/auth.module';
import { UserModule } from '../../../user/user.module';
import {
  AUTH_TEST_ENTITIES,
  DOMAIN_TEST_ENTITIES,
  registerAndLoginAsSuperAdmin,
} from '../../../../test/controller-test.helpers';
import {
  getIntegrationTestDatabaseConfig,
  prepareIntegrationTestDatabase,
} from '../../../../test/test-database.config';

describe('RoomController', () => {
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
    checkInTime: 'Test CheckInTime',
    checkOutTime: 'Test CheckOutTime',
    ownerId: 1,
  } as const;

  const defaultRoom = {
    name: 'Test Room',
    description: 'Test Description',
    pricePerNight: 100,
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    beds: 1,
    quantity: 1,
    size: 1,
    status: 'available',
  } as const;

  beforeAll(async () => {
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
          secret: '1234',
          signOptions: { expiresIn: '5h' },
        }),
        AuthModule,
        UserModule,
        RoomsModule,
      ],
    }).compile();

    dataSource = moduleRef.get(DataSource);

    app = moduleRef.createNestApplication();
    await app.init();

    token = await registerAndLoginAsSuperAdmin(app, dataSource);
  });

  it(`/GET rooms`, async () => {
    const repository = dataSource.getRepository(RoomEntity);
    const property = await dataSource
      .getRepository(PropertyEntity)
      .save({ ...defaultProperty });

    await repository.save({ ...defaultRoom, propertyId: property.id });

    const response = await request(app.getHttpServer())
      .get('/rooms')
      .expect(200);

    expect(response.body.data[0]).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        ...defaultRoom,
        roomTypeId: null,
        roomType: null,
        images: [],
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
    );
  });

  it('/GET rooms?checkIn&checkOut excludes rooms with blocked dates', async () => {
    const property = await dataSource
      .getRepository(PropertyEntity)
      .save({ ...defaultProperty, name: 'Date Filter Property' });

    const availableRoom = await dataSource.getRepository(RoomEntity).save({
      ...defaultRoom,
      name: 'Available Suite',
      propertyId: property.id,
    });
    const blockedRoom = await dataSource.getRepository(RoomEntity).save({
      ...defaultRoom,
      name: 'Blocked Suite',
      propertyId: property.id,
    });

    await dataSource.getRepository(RoomBlockedDateOrmEntity).save({
      roomId: blockedRoom.id,
      startDate: '2026-12-01',
      endDate: '2026-12-10',
      reason: 'Fermeture',
    });

    const response = await request(app.getHttpServer())
      .get('/rooms')
      .query({ checkIn: '2026-12-03', checkOut: '2026-12-06', limit: 25 })
      .expect(200);

    const ids = (response.body.data as Array<{ id: number }>).map((room) => room.id);
    expect(ids).toContain(availableRoom.id);
    expect(ids).not.toContain(blockedRoom.id);
  });

  it(`/GET rooms/:id`, async () => {
    const repository = dataSource.getRepository(RoomEntity);
    const room = await repository.save({ ...defaultRoom });

    const response = await request(app.getHttpServer())
      .get(`/rooms/${room.id}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: room.id,
        ...defaultRoom,
        roomTypeId: null,
        roomType: null,
        images: [],
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
    );
  });

  it('/POST rooms', async () => {
    const response = await request(app.getHttpServer())
      .post('/rooms')
      .send({ ...defaultRoom })
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        ...defaultRoom,
        roomTypeId: null,
        roomType: null,
        images: [],
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
    );
  });

  it('/POST rooms with images', async () => {
    const property = await dataSource
      .getRepository(PropertyEntity)
      .save({ ...defaultProperty });

    const response = await request(app.getHttpServer())
      .post('/rooms')
      .field('name', defaultRoom.name)
      .field('description', defaultRoom.description)
      .field('pricePerNight', String(defaultRoom.pricePerNight))
      .field('maxGuests', String(defaultRoom.maxGuests))
      .field('bedrooms', String(defaultRoom.bedrooms))
      .field('bathrooms', String(defaultRoom.bathrooms))
      .field('beds', String(defaultRoom.beds))
      .field('quantity', String(defaultRoom.quantity))
      .field('size', String(defaultRoom.size))
      .field('status', defaultRoom.status)
      .field('property', JSON.stringify({ id: property.id }))
      .attach('images', Buffer.from('room-1'), 'room1.jpg')
      .attach('images', Buffer.from('room-2'), 'room2.jpg')
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    expect(response.body.images).toHaveLength(2);
    expect(response.body.images[0]).toMatch(
      /uploads\/\d+\/room\/\d+\/.+\.jpg$/,
    );
    expect(response.body.images[1]).toMatch(
      /uploads\/\d+\/room\/\d+\/.+\.jpg$/,
    );
  });

  it('/PUT rooms/:id', async () => {
    const repository = dataSource.getRepository(RoomEntity);
    const property = await dataSource
      .getRepository(PropertyEntity)
      .save({ ...defaultProperty });
    const updatedData = {
      name: 'Updated Room',
      description: 'Updated Description',
      pricePerNight: 150,
      maxGuests: 3,
      bedrooms: 2,
      bathrooms: 2,
      beds: 2,
      quantity: 2,
      size: 2,
      status: 'available',
    };

    const room = await repository.save({
      ...defaultRoom,
      propertyId: property.id,
    });

    await request(app.getHttpServer())
      .put(`/rooms/${room.id}`)
      .send({ ...updatedData })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const updatedRoom = await repository.findOne({ where: { id: room.id } });

    expect(updatedRoom).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        ...updatedData,
      }),
    );
  });

  it('/DELETE rooms/:id', async () => {
    const repository = dataSource.getRepository(RoomEntity);

    const room = await repository.save({ ...defaultRoom });

    await request(app.getHttpServer())
      .delete(`/rooms/${room.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const deletedRoom = await repository.findOne({ where: { id: room.id } });
    expect(deletedRoom).toBeNull();
  });

  afterAll(async () => {
    await app.close();
  });
});
