import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { Property } from '@src/modules/properties/contracts';
import { Room } from '@src/modules/rooms/contracts';
import { CANCELLATION_POLICY } from '@src/modules/reservation/domain/constants/cancellation-policy.constant';
import { EmailVO } from '@src/shared/valueObject/email.vo';
import { PhoneNumberVO } from '@src/shared/valueObject/phone.vo';
import { User, UserNameVO } from '@src/modules/user/contracts';
import {
  createReservationRepositoryMock,
  createSampleReservation,
  createSampleReservationItem,
} from '@src/modules/reservation/applications/useCase/reservation-test.helpers';
import { AssertReservationAccessService } from './assert-reservation-access.service';

function createRoom(propertyId: number): Room {
  return new Room({
    id: 10,
    name: 'Suite',
    slug: 'suite',
    description: 'Desc',
    pricePerNight: 100,
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    beds: 1,
    quantity: 1,
    size: 30,
    status: 'available',
    property: new Property({
      id: propertyId,
      name: 'Hotel',
      description: 'Desc',
      address: '1 rue',
      city: 'Paris',
      country: 'France',
      latitude: 0,
      longitude: 0,
      checkInTime: '15:00',
      checkOutTime: '11:00',
      ownerId: 1,
      cancellationPolicy: CANCELLATION_POLICY.MODERATE,
    }),
  });
}

describe('AssertReservationAccessService', () => {
  it('lève NotFound quand la réservation est absente', async () => {
    const service = new AssertReservationAccessService(
      createReservationRepositoryMock({
        findById: vi.fn().mockResolvedValue(null),
      }),
      { findByAuthId: vi.fn() } as never,
      { findById: vi.fn() } as never,
      { findAllByOwnerId: vi.fn() } as never,
    );

    await expect(service.requireReservation(99)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('autorise canReadAll sans consulter le user', async () => {
    const userRepository = { findByAuthId: vi.fn() };
    const service = new AssertReservationAccessService(
      createReservationRepositoryMock(),
      userRepository as never,
      { findById: vi.fn() } as never,
      { findAllByOwnerId: vi.fn() } as never,
    );

    await expect(
      service.assertCanManage(createSampleReservation({ userId: 5 }), {
        authId: 1,
        canReadAll: true,
        canReadHost: false,
      }),
    ).resolves.toBeUndefined();
    expect(userRepository.findByAuthId).not.toHaveBeenCalled();
  });

  it('autorise le propriétaire de la réservation', async () => {
    const user = new User(
      new UserNameVO('Jean'),
      new UserNameVO('Dupont'),
      new EmailVO('jean@test.com'),
      new PhoneNumberVO('+33601020304'),
      '',
      5,
    );
    const service = new AssertReservationAccessService(
      createReservationRepositoryMock(),
      { findByAuthId: vi.fn().mockResolvedValue(user) } as never,
      { findById: vi.fn() } as never,
      { findAllByOwnerId: vi.fn() } as never,
    );

    await expect(
      service.assertCanManage(createSampleReservation({ userId: 5 }), {
        authId: 1,
        canReadAll: false,
        canReadHost: false,
      }),
    ).resolves.toBeUndefined();
  });

  it('autorise un hôte propriétaire de l’établissement', async () => {
    const user = new User(
      new UserNameVO('Host'),
      new UserNameVO('Owner'),
      new EmailVO('host@test.com'),
      new PhoneNumberVO('+33601020304'),
      '',
      8,
    );
    const roomRepository = {
      findById: vi.fn().mockResolvedValue(createRoom(3)),
    };
    const propertyRepository = {
      findAllByOwnerId: vi.fn().mockResolvedValue([{ id: 3 }]),
    };
    const service = new AssertReservationAccessService(
      createReservationRepositoryMock(),
      { findByAuthId: vi.fn().mockResolvedValue(user) } as never,
      roomRepository as never,
      propertyRepository as never,
    );

    await expect(
      service.assertCanManage(
        createSampleReservation({
          userId: 5,
          items: [createSampleReservationItem({ roomId: 10 })],
        }),
        {
          authId: 2,
          canReadAll: false,
          canReadHost: true,
        },
      ),
    ).resolves.toBeUndefined();
  });

  it('refuse l’accès sinon', async () => {
    const user = new User(
      new UserNameVO('Alice'),
      new UserNameVO('Martin'),
      new EmailVO('alice@test.com'),
      new PhoneNumberVO('+33601020304'),
      '',
      9,
    );
    const service = new AssertReservationAccessService(
      createReservationRepositoryMock(),
      { findByAuthId: vi.fn().mockResolvedValue(user) } as never,
      { findById: vi.fn() } as never,
      { findAllByOwnerId: vi.fn().mockResolvedValue([]) } as never,
    );

    await expect(
      service.assertCanManage(createSampleReservation({ userId: 5 }), {
        authId: 2,
        canReadAll: false,
        canReadHost: true,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
