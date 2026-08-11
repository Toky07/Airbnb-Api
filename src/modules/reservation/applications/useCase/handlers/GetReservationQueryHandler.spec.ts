import { describe, expect, it, vi } from 'vitest';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Property } from '../../../../properties/contracts';
import type { IPropertyRepository } from '../../../../properties/contracts';
import { Room } from '../../../../rooms/contracts';
import type { IRoomRepository } from '../../../../rooms/contracts';
import { UserNameVO } from '../../../../user/contracts';
import { EmailVO } from '../../../../../shared/valueObject/email.vo';
import { PhoneNumberVO } from '../../../../../shared/valueObject/phone.vo';
import { User } from '../../../../user/contracts';
import type { IUserRepository } from '../../../../user/contracts';
import { GetReservationQueryHandler } from './GetReservationQueryHandler';
import { GetReservationQuery } from '../queries/GetReservationQuery';
import {
  createReservationRepositoryMock,
  createSampleReservation,
  createSampleReservationItem,
} from '../reservation-test.helpers';

function createEnrichReservationOutputsMock() {
  return {
    enrich: vi.fn().mockImplementation(async (outputs: unknown[]) => outputs),
  };
}

describe('GetReservationQueryHandler', () => {
  it('retourne une réservation pour un administrateur', async () => {
    const reservation = createSampleReservation({ id: 7 });
    const handler = new GetReservationQueryHandler(
      createReservationRepositoryMock({
        findById: vi.fn().mockResolvedValue(reservation),
      }),
      { findByAuthId: vi.fn() } as unknown as IUserRepository,
      { findById: vi.fn() } as unknown as IRoomRepository,
      { findByOwnerId: vi.fn() } as unknown as IPropertyRepository,
      createEnrichReservationOutputsMock() as never,
    );

    const result = await handler.execute(
      new GetReservationQuery(7, {
        authId: 1,
        canReadAll: true,
        canReadHost: false,
      }),
    );

    expect(result.id).toBe(7);
  });

  it('autorise le propriétaire de la réservation', async () => {
    const reservation = createSampleReservation({ id: 7, userId: 5 });
    const user = new User(
      new UserNameVO('Jean'),
      new UserNameVO('Dupont'),
      new EmailVO('jean@test.com'),
      new PhoneNumberVO('+33601020304'),
      '',
      5,
    );

    const handler = new GetReservationQueryHandler(
      createReservationRepositoryMock({
        findById: vi.fn().mockResolvedValue(reservation),
      }),
      {
        findByAuthId: vi.fn().mockResolvedValue(user),
      } as unknown as IUserRepository,
      { findById: vi.fn() } as unknown as IRoomRepository,
      { findByOwnerId: vi.fn() } as unknown as IPropertyRepository,
      createEnrichReservationOutputsMock() as never,
    );

    const result = await handler.execute(
      new GetReservationQuery(7, {
        authId: 1,
        canReadAll: false,
        canReadHost: false,
      }),
    );

    expect(result.userId).toBe(5);
  });

  it('refuse l’accès à un autre utilisateur', async () => {
    const reservation = createSampleReservation({ id: 7, userId: 5 });
    const user = new User(
      new UserNameVO('Alice'),
      new UserNameVO('Martin'),
      new EmailVO('alice@test.com'),
      new PhoneNumberVO('+33601020304'),
      '',
      6,
    );

    const handler = new GetReservationQueryHandler(
      createReservationRepositoryMock({
        findById: vi.fn().mockResolvedValue(reservation),
      }),
      {
        findByAuthId: vi.fn().mockResolvedValue(user),
      } as unknown as IUserRepository,
      { findById: vi.fn() } as unknown as IRoomRepository,
      { findByOwnerId: vi.fn() } as unknown as IPropertyRepository,
      createEnrichReservationOutputsMock() as never,
    );

    await expect(
      handler.execute(
        new GetReservationQuery(7, {
          authId: 2,
          canReadAll: false,
          canReadHost: false,
        }),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('autorise un hôte sur sa propriété', async () => {
    const reservation = createSampleReservation({
      id: 7,
      userId: 5,
      items: [
        createSampleReservationItem({ id: 1, reservationId: 7, roomId: 10 }),
      ],
    });
    const host = new User(
      new UserNameVO('Host'),
      new UserNameVO('Owner'),
      new EmailVO('host@test.com'),
      new PhoneNumberVO('+33601020304'),
      '',
      2,
    );
    const property = new Property({
      id: 3,
      name: 'Hotel',
      description: 'Desc',
      address: 'A',
      city: 'Paris',
      country: 'France',
      latitude: 0,
      longitude: 0,
      checkInTime: '15:00',
      checkOutTime: '11:00',
      ownerId: 2,
    });
    const room = new Room({
      id: 10,
      name: 'Suite',
      description: 'Desc',
      pricePerNight: 100,
      maxGuests: 2,
      bedrooms: 1,
      bathrooms: 1,
      beds: 1,
      quantity: 1,
      size: 20,
      status: 'available',
      property,
    });

    const handler = new GetReservationQueryHandler(
      createReservationRepositoryMock({
        findById: vi.fn().mockResolvedValue(reservation),
      }),
      {
        findByAuthId: vi.fn().mockResolvedValue(host),
      } as unknown as IUserRepository,
      {
        findById: vi.fn().mockResolvedValue(room),
      } as unknown as IRoomRepository,
      {
        findAllByOwnerId: vi.fn().mockResolvedValue([property]),
      } as unknown as IPropertyRepository,
      createEnrichReservationOutputsMock() as never,
    );

    const result = await handler.execute(
      new GetReservationQuery(7, {
        authId: 10,
        canReadAll: false,
        canReadHost: true,
      }),
    );

    expect(result.items[0]?.roomId).toBe(10);
  });

  it('lève une erreur si la réservation est introuvable', async () => {
    const handler = new GetReservationQueryHandler(
      createReservationRepositoryMock({
        findById: vi.fn().mockResolvedValue(null),
      }),
      { findByAuthId: vi.fn() } as unknown as IUserRepository,
      { findById: vi.fn() } as unknown as IRoomRepository,
      { findByOwnerId: vi.fn() } as unknown as IPropertyRepository,
      createEnrichReservationOutputsMock() as never,
    );

    await expect(
      handler.execute(
        new GetReservationQuery(99, {
          authId: 1,
          canReadAll: true,
          canReadHost: false,
        }),
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
