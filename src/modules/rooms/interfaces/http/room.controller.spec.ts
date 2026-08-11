import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RoomEntity } from '@src/modules/rooms/infrastructure/entities/room.entity';
import { RoomBlockedDateOrmEntity } from '@src/modules/rooms/infrastructure/entities/room-blocked-date.orm-entity';
import { PropertyEntity } from '@src/modules/properties/infrastructure/entities/property-entity.entity';
import { registerAndLoginAsSuperAdmin } from '@src/test/controller-test.helpers';
import { setupE2eApp } from '@src/test/e2e-app';

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
    const ctx = await setupE2eApp();
    app = ctx.app;
    dataSource = ctx.dataSource;

    token = await registerAndLoginAsSuperAdmin(app, dataSource);
  });

  it(`/GET rooms`, async () => {
    const repository = dataSource.getRepository(RoomEntity);
    const property = await dataSource
      .getRepository(PropertyEntity)
      .save({ ...defaultProperty });

    await repository.save({ ...defaultRoom, property });

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

  it('/GET rooms?minPrice&maxPrice&city filters rooms', async () => {
    const cheapProperty = await dataSource.getRepository(PropertyEntity).save({
      ...defaultProperty,
      name: 'Budget Property',
      city: 'Lyon',
    });
    const premiumProperty = await dataSource
      .getRepository(PropertyEntity)
      .save({
        ...defaultProperty,
        name: 'Premium Property',
        city: 'Paris',
      });

    const cheapRoom = await dataSource.getRepository(RoomEntity).save({
      ...defaultRoom,
      name: 'Budget Room',
      pricePerNight: 80,
      property: cheapProperty,
    });
    await dataSource.getRepository(RoomEntity).save({
      ...defaultRoom,
      name: 'Premium Room',
      pricePerNight: 300,
      property: premiumProperty,
    });

    const response = await request(app.getHttpServer())
      .get('/rooms')
      .query({ minPrice: 50, maxPrice: 120, city: 'Lyon', limit: 25 })
      .expect(200);

    const ids = (response.body.data as Array<{ id: number }>).map(
      (room) => room.id,
    );
    expect(ids).toEqual([cheapRoom.id]);
  });

  it('/GET rooms?lat&lng&radiusKm filters rooms by distance', async () => {
    const parisProperty = await dataSource.getRepository(PropertyEntity).save({
      ...defaultProperty,
      name: 'Paris Property',
      city: 'Paris',
      latitude: 48.8566,
      longitude: 2.3522,
    });
    const lyonProperty = await dataSource.getRepository(PropertyEntity).save({
      ...defaultProperty,
      name: 'Lyon Property',
      city: 'Lyon',
      latitude: 45.764,
      longitude: 4.8357,
    });

    const parisRoom = await dataSource.getRepository(RoomEntity).save({
      ...defaultRoom,
      name: 'Paris Room',
      property: parisProperty,
    });
    await dataSource.getRepository(RoomEntity).save({
      ...defaultRoom,
      name: 'Lyon Room',
      property: lyonProperty,
    });

    const response = await request(app.getHttpServer())
      .get('/rooms')
      .query({ lat: 48.8566, lng: 2.3522, radiusKm: 25, limit: 25 })
      .expect(200);

    const ids = (response.body.data as Array<{ id: number }>).map(
      (room) => room.id,
    );
    expect(ids).toEqual([parisRoom.id]);
  });

  it('/GET rooms?checkIn&checkOut excludes rooms with blocked dates', async () => {
    const property = await dataSource
      .getRepository(PropertyEntity)
      .save({ ...defaultProperty, name: 'Date Filter Property' });

    const availableRoom = await dataSource.getRepository(RoomEntity).save({
      ...defaultRoom,
      name: 'Available Suite',
      property,
    });
    const blockedRoom = await dataSource.getRepository(RoomEntity).save({
      ...defaultRoom,
      name: 'Blocked Suite',
      property,
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

    const ids = (response.body.data as Array<{ id: number }>).map(
      (room) => room.id,
    );
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
      property,
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
});
