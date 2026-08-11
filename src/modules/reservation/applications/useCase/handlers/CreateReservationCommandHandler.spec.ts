import { describe, expect, it, vi } from 'vitest';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ResolveDynamicStayAmountService } from '@src/shared/pricing/resolve-dynamic-stay-amount.service';
import { RoomStayPricingService } from '@src/modules/rooms/contracts';
import { Property } from '@src/modules/properties/contracts';
import { Room } from '@src/modules/rooms/contracts';
import type { IRoomRepository } from '@src/modules/rooms/contracts';
import { UserNameVO } from '@src/modules/user/contracts';
import { EmailVO } from '@src/shared/valueObject/email.vo';
import { PhoneNumberVO } from '@src/shared/valueObject/phone.vo';
import { User } from '@src/modules/user/contracts';
import type { IUserRepository } from '@src/modules/user/contracts';
import { RESERVATION_STATUS } from '@src/modules/reservation/domain/constants/reservation-status.constant';
import { CreateReservationCommandHandler } from './CreateReservationCommandHandler';
import { CreateReservationCommand } from '@src/modules/reservation/applications/useCase/commands/CreateReservationCommand';
import { createReservationRepositoryMock } from '@src/modules/reservation/applications/useCase/reservation-test.helpers';

function createEnrichMock() {
  return {
    enrich: vi.fn().mockImplementation(async (outputs: unknown[]) => outputs),
  };
}

function createRoomStayPricingMock() {
  const resolver = new ResolveDynamicStayAmountService();
  return {
    resolveForRoom: vi.fn(
      async (room: Room, checkIn: string, checkOut: string) =>
        resolver.resolve({
          checkIn,
          checkOut,
          pricePerNight: room.pricePerNight,
          weekendPricePerNight: room.weekendPricePerNight,
        }),
    ),
  } as unknown as RoomStayPricingService;
}

describe('CreateReservationCommandHandler', () => {
  const room = new Room({
    id: 10,
    name: 'Suite',
    description: 'Grande suite',
    pricePerNight: 120,
    maxGuests: 4,
    bedrooms: 1,
    bathrooms: 1,
    beds: 1,
    quantity: 1,
    size: 35,
    status: 'available',
    property: new Property({
      name: 'Hotel',
      description: 'Desc',
      address: '1 rue Test',
      city: 'Paris',
      country: 'France',
      latitude: 0,
      longitude: 0,
      checkInTime: '15:00',
      checkOutTime: '11:00',
      ownerId: 1,
    }),
  });

  const user = new User(
    new UserNameVO('Jean'),
    new UserNameVO('Dupont'),
    new EmailVO('jean@test.com'),
    new PhoneNumberVO('+33601020304'),
    '',
    5,
  );

  it('crée une réservation en attente avec holdUntil', async () => {
    const reservationRepository = createReservationRepositoryMock();
    const handler = new CreateReservationCommandHandler(
      reservationRepository,
      {
        findById: vi.fn().mockResolvedValue(room),
      } as unknown as IRoomRepository,
      {
        findByAuthId: vi.fn().mockResolvedValue(user),
      } as unknown as IUserRepository,
      createRoomStayPricingMock(),
      createEnrichMock() as never,
    );

    const result = await handler.execute(
      new CreateReservationCommand(1, [
        {
          roomId: 10,
          startDate: '2026-07-01',
          endDate: '2026-07-03',
          guestCount: 2,
        },
      ]),
    );

    expect(result.status).toBe(RESERVATION_STATUS.PENDING);
    expect(result.items[0]?.price).toBe(240);
    expect(result.items[0]?.nights).toBe(2);
    expect(result.holdUntil).toBeInstanceOf(Date);
    expect(reservationRepository.createWithHold).toHaveBeenCalled();
  });

  it('rejette si createWithHold signale une indisponibilité', async () => {
    const reservationRepository = createReservationRepositoryMock({
      createWithHold: vi
        .fn()
        .mockRejectedValue(
          new BadRequestException(
            'Cette chambre n’est pas disponible pour les dates sélectionnées.',
          ),
        ),
    });

    const handler = new CreateReservationCommandHandler(
      reservationRepository,
      {
        findById: vi.fn().mockResolvedValue(room),
      } as unknown as IRoomRepository,
      {
        findByAuthId: vi.fn().mockResolvedValue(user),
      } as unknown as IUserRepository,
      createRoomStayPricingMock(),
      createEnrichMock() as never,
    );

    await expect(
      handler.execute(
        new CreateReservationCommand(1, [
          {
            roomId: 10,
            startDate: '2026-07-01',
            endDate: '2026-07-03',
            guestCount: 2,
          },
        ]),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('lève une erreur si l’utilisateur est introuvable', async () => {
    const handler = new CreateReservationCommandHandler(
      createReservationRepositoryMock(),
      { findById: vi.fn() } as unknown as IRoomRepository,
      {
        findByAuthId: vi.fn().mockResolvedValue(null),
      } as unknown as IUserRepository,
      createRoomStayPricingMock(),
      createEnrichMock() as never,
    );

    await expect(
      handler.execute(
        new CreateReservationCommand(1, [
          {
            roomId: 10,
            startDate: '2026-07-01',
            endDate: '2026-07-03',
            guestCount: 2,
          },
        ]),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('lève une erreur si la chambre est introuvable', async () => {
    const handler = new CreateReservationCommandHandler(
      createReservationRepositoryMock(),
      {
        findById: vi.fn().mockResolvedValue(null),
      } as unknown as IRoomRepository,
      {
        findByAuthId: vi.fn().mockResolvedValue(user),
      } as unknown as IUserRepository,
      createRoomStayPricingMock(),
      createEnrichMock() as never,
    );

    await expect(
      handler.execute(
        new CreateReservationCommand(1, [
          {
            roomId: 99,
            startDate: '2026-07-01',
            endDate: '2026-07-03',
            guestCount: 2,
          },
        ]),
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
