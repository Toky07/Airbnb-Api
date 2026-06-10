import { describe, expect, it, vi } from 'vitest';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CalculateStayAmountService } from '../../../../shared/pricing/calculate-stay-amount.service';
import { Property } from '../../../properties/domain/entities/property.entity';
import { Room } from '../../../rooms/domain/entities/room.entity';
import type { IRoomRepository } from '../../../rooms/domain/repositories/room.repository';
import { UserNameVO } from '../../../user/domain/valueObject/username.vo';
import { EmailVO } from '../../../../shared/valueObject/email.vo';
import { PhoneNumberVO } from '../../../../shared/valueObject/phone.vo';
import { User } from '../../../user/domain/entities/user.entity';
import type { IUserRepository } from '../../../user/domain/repositories/user.repository';
import { RESERVATION_STATUS } from '../../domain/constants/reservation-status.constant';
import { CheckRoomAvailabilityService } from '../services/check-room-availability.service';
import { CreateReservationUseCase } from './create-reservation.usecase';
import {
  createReservationRepositoryMock,
  createSampleReservation,
} from './reservation-test.helpers';

describe('CreateReservationUseCase', () => {
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

  it('crée une réservation en attente', async () => {
    const reservationRepository = createReservationRepositoryMock();
    const useCase = new CreateReservationUseCase(
      reservationRepository,
      { findById: vi.fn().mockResolvedValue(room) } as unknown as IRoomRepository,
      { findByAuthId: vi.fn().mockResolvedValue(user) } as unknown as IUserRepository,
      new CheckRoomAvailabilityService(reservationRepository),
      new CalculateStayAmountService(),
    );

    const result = await useCase.execute(1, {
      roomId: 10,
      startDate: '2026-07-01',
      endDate: '2026-07-03',
      guestCount: 2,
    });

    expect(result.status).toBe(RESERVATION_STATUS.PENDING);
    expect(result.totalPrice).toBe(240);
    expect(result.nights).toBe(2);
  });

  it('rejette si la chambre est indisponible sur les dates', async () => {
    const reservationRepository = createReservationRepositoryMock({
      findOverlapping: vi
        .fn()
        .mockResolvedValue([createSampleReservation({ id: 99 })]),
    });

    const useCase = new CreateReservationUseCase(
      reservationRepository,
      { findById: vi.fn().mockResolvedValue(room) } as unknown as IRoomRepository,
      { findByAuthId: vi.fn().mockResolvedValue(user) } as unknown as IUserRepository,
      new CheckRoomAvailabilityService(reservationRepository),
      new CalculateStayAmountService(),
    );

    await expect(
      useCase.execute(1, {
        roomId: 10,
        startDate: '2026-07-01',
        endDate: '2026-07-03',
        guestCount: 2,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('lève une erreur si l’utilisateur est introuvable', async () => {
    const useCase = new CreateReservationUseCase(
      createReservationRepositoryMock(),
      { findById: vi.fn() } as unknown as IRoomRepository,
      { findByAuthId: vi.fn().mockResolvedValue(null) } as unknown as IUserRepository,
      new CheckRoomAvailabilityService(createReservationRepositoryMock()),
      new CalculateStayAmountService(),
    );

    await expect(
      useCase.execute(1, {
        roomId: 10,
        startDate: '2026-07-01',
        endDate: '2026-07-03',
        guestCount: 2,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('lève une erreur si la chambre est introuvable', async () => {
    const useCase = new CreateReservationUseCase(
      createReservationRepositoryMock(),
      { findById: vi.fn().mockResolvedValue(null) } as unknown as IRoomRepository,
      { findByAuthId: vi.fn().mockResolvedValue(user) } as unknown as IUserRepository,
      new CheckRoomAvailabilityService(createReservationRepositoryMock()),
      new CalculateStayAmountService(),
    );

    await expect(
      useCase.execute(1, {
        roomId: 99,
        startDate: '2026-07-01',
        endDate: '2026-07-03',
        guestCount: 2,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
