import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PropertyEntity } from '@src/modules/properties/infrastructure/entities/property-entity.entity';
import { RoomEntity } from '@src/modules/rooms/infrastructure/entities/room.entity';
import { registerAndLoginAsSuperAdmin } from '@src/test/controller-test.helpers';
import { jpegBuffer } from '@src/test/image-fixtures';
import { setupE2eApp } from '@src/test/e2e-app';

describe('PropertyController', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let token: string;

  const room = {
    name: 'Test Room',
    description: 'Test Description',
    pricePerNight: 100,
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    beds: 2,
    quantity: 1,
    size: 100,
    status: 'Test Status',
  } as const;

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
    cancellationPolicy: 'moderate',
    touristTaxPerGuestNight: 0,
    houseRules: '',
    checkInInstructions: '',
    wifiName: '',
    wifiPassword: '',
    emergencyContact: '',
    ownerId: 1,
  } as const;

  beforeAll(async () => {
    const ctx = await setupE2eApp();
    app = ctx.app;
    dataSource = ctx.dataSource;

    token = await registerAndLoginAsSuperAdmin(app, dataSource);
  });

  it(`/GET properties`, async () => {
    const repository = dataSource.getRepository(PropertyEntity);
    const property = await repository.save({ ...defaultProperty });

    await dataSource.getRepository(RoomEntity).save({ ...room, property });

    const response = await request(app.getHttpServer())
      .get('/properties')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.data[0]).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        ...defaultProperty,
        image: null,
        propertyTypeId: null,
        propertyType: null,
        ownerId: expect.any(Number),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
    );
    expect(response.body.data[0].rooms[0]).toEqual(
      expect.objectContaining({
        ...room,
        id: expect.any(Number),
        images: [],
      }),
    );
  });

  it(`/GET properties/:id`, async () => {
    const repository = dataSource.getRepository(PropertyEntity);
    const property = await repository.save({ ...defaultProperty });

    const response = await request(app.getHttpServer())
      .get(`/properties/${property.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual({
      id: property.id,
      ...defaultProperty,
      image: null,
      propertyTypeId: null,
      propertyType: null,
      rooms: [],
      ownerId: expect.any(Number),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it('/POST properties', async () => {
    const response = await request(app.getHttpServer())
      .post('/properties')
      .send({ ...defaultProperty })
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    expect(response.body).toEqual({
      id: expect.any(Number),
      ...defaultProperty,
      image: null,
      propertyTypeId: null,
      propertyType: null,
      rooms: [],
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it('/POST properties with image', async () => {
    const response = await request(app.getHttpServer())
      .post('/properties')
      .field('name', defaultProperty.name)
      .field('description', defaultProperty.description)
      .field('address', defaultProperty.address)
      .field('city', defaultProperty.city)
      .field('country', defaultProperty.country)
      .field('latitude', String(defaultProperty.latitude))
      .field('longitude', String(defaultProperty.longitude))
      .field('checkInTime', defaultProperty.checkInTime)
      .field('checkOutTime', defaultProperty.checkOutTime)
      .field('ownerId', String(defaultProperty.ownerId))
      .attach('image', jpegBuffer('property-image'), 'property.jpg')
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    expect(response.body.image).toMatch(/uploads\/\d+\/property\/.+\.jpg$/);
    expect(response.body.name).toBe(defaultProperty.name);
  });

  it('/PUT properties/:id', async () => {
    const repository = dataSource.getRepository(PropertyEntity);
    const updatedData = {
      name: 'Updated Property',
      description: 'Updated Description',
      address: 'Updated Address',
      city: 'Updated City',
      country: 'Updated Country',
      latitude: 0,
      longitude: 0,
      checkInTime: 'Updated CheckInTime',
      checkOutTime: 'Updated CheckOutTime',
      ownerId: 1,
    };

    const property = await repository.save({ ...defaultProperty });

    await request(app.getHttpServer())
      .put(`/properties/${property.id}`)
      .send({ ...updatedData })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const updatedProperty = await repository.findOne({
      where: { id: property.id },
    });

    expect(updatedProperty).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        ...updatedData,
        ownerId: 1,
      }),
    );
  });

  it('/PUT properties/:id with image', async () => {
    const repository = dataSource.getRepository(PropertyEntity);
    const property = await repository.save({ ...defaultProperty });

    const response = await request(app.getHttpServer())
      .put(`/properties/${property.id}`)
      .field('name', 'Updated With Image')
      .field('description', defaultProperty.description)
      .field('address', defaultProperty.address)
      .field('city', defaultProperty.city)
      .field('country', defaultProperty.country)
      .field('latitude', String(defaultProperty.latitude))
      .field('longitude', String(defaultProperty.longitude))
      .field('checkInTime', defaultProperty.checkInTime)
      .field('checkOutTime', defaultProperty.checkOutTime)
      .field('ownerId', String(defaultProperty.ownerId))
      .attach('image', jpegBuffer('updated-image'), 'updated.jpg')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.image).toMatch(/uploads\/\d+\/property\/.+\.jpg$/);
    expect(response.body.name).toBe('Updated With Image');
  });

  it('/DELETE properties/:id', async () => {
    const repository = dataSource.getRepository(PropertyEntity);

    const property = await repository.save({ ...defaultProperty });

    await request(app.getHttpServer())
      .delete(`/properties/${property.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const deletedProperty = await repository.findOne({
      where: { id: property.id },
    });
    expect(deletedProperty).toBeNull();
  });
});
