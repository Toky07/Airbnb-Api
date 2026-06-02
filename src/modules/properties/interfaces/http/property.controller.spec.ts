import request from 'supertest';
import { Test } from '@nestjs/testing';
import { PropertiesModule } from '../../properties.module';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PropertyEntity } from '../../infrastructure/entities/property-entity.entity';
import { RoomEntity } from '../../../rooms/infrastructure/entities/room.entity';

describe('Cats', () => {
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
    ownerId: 1,
  } as const;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [PropertyEntity, RoomEntity],
          synchronize: true,
        }),
        JwtModule.register({
          global: true,
          secret: '1234',
          secretOrPrivateKey: '1234',
          signOptions: { expiresIn: '5h' },
        }),
        PropertiesModule,
      ],
    }).compile();

    dataSource = moduleRef.get(DataSource);

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it(`/GET properties`, async () => {
    const repository = dataSource.getRepository(PropertyEntity);
    const property = await repository.save({ ...defaultProperty });

    await dataSource.getRepository(RoomEntity).save({ ...room, property });

    const response = await request(app.getHttpServer())
      .get('/properties')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual([{
      id: expect.any(Number),
      ...defaultProperty,
      rooms: [
        {
          ...room,
          id: expect.any(Number),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }
      ],
      ownerId: expect.any(Number),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    }]);
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
      rooms: [],
      ownerId: expect.any(Number),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it('/POST properties', async () => {
    const response = await request(app.getHttpServer())
      .post('/properties')
      .send({...defaultProperty})
      .set('Authorization', `Bearer ${token}`)
      .expect(201);
    
    expect(response.body).toEqual({
      id: expect.any(Number),
      ...defaultProperty,
      rooms: [],
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
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

    const updatedProperty = await repository.findOne({ where: { id: property.id } });

    expect(updatedProperty).toEqual({
      id: expect.any(Number),
      ...updatedData,
      ownerId: 1,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });

  it('/DELETE properties/:id', async () => {
    const repository = dataSource.getRepository(PropertyEntity);

    const property = await repository.save({ ...defaultProperty });

    await request(app.getHttpServer())
      .delete(`/properties/${property.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const deletedProperty = await repository.findOne({ where: { id: property.id } });
    expect(deletedProperty).toBeNull();
  });

  afterAll(async () => {
    await app.close();
  });
});
