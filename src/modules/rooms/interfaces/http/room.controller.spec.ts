import request from 'supertest';
import { Test } from '@nestjs/testing';
import { RoomsModule } from '../../room.module';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { JwtModule } from '@nestjs/jwt';
import { RoomEntity } from '../../infrastructure/entities/room.entity';
import { PropertyEntity } from '../../../properties/infrastructure/entities/property-entity.entity';

describe('Cats', () => {
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
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [RoomEntity, PropertyEntity],
          synchronize: true,
        }),
        JwtModule.register({
          global: true,
          secret: '1234',
          secretOrPrivateKey: '1234',
          signOptions: { expiresIn: '5h' },
        }),
        RoomsModule,
      ],
    }).compile();

    dataSource = moduleRef.get(DataSource);

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it(`/GET rooms`, async () => {
    const repository = dataSource.getRepository(RoomEntity);
    const property = await dataSource.getRepository(PropertyEntity).save({ ...defaultProperty });

    await repository.save({ ...defaultRoom, propertyId: property.id });

    const response = await request(app.getHttpServer())
      .get('/rooms')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual([{
      id: expect.any(Number),
      ...defaultRoom,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    }]);
  });

  it(`/GET rooms/:id`, async () => {
    const repository = dataSource.getRepository(RoomEntity);
    const room = await repository.save({ ...defaultRoom });

    const response = await request(app.getHttpServer())
      .get(`/rooms/${room.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual({
      id: room.id,
      ...defaultRoom,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it('/POST rooms', async () => {
    const response = await request(app.getHttpServer())
      .post('/rooms')
      .send({...defaultRoom})
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    expect(response.body).toEqual({
      id: expect.any(Number),
      ...defaultRoom,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it('/PUT rooms/:id', async () => {
    const repository = dataSource.getRepository(RoomEntity);
    const property = await dataSource.getRepository(PropertyEntity).save({ ...defaultProperty });
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

    const room = await repository.save({ ...defaultRoom, propertyId: property.id });

    await request(app.getHttpServer())
      .put(`/rooms/${room.id}`)
      .send({ ...updatedData })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const updatedRoom = await repository.findOne({ where: { id: room.id } });

    expect(updatedRoom).toEqual({
      id: expect.any(Number),
      ...updatedData,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
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
