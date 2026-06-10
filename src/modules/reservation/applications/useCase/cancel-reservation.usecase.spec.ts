import { describe, expect, it, vi } from 'vitest';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { UserNameVO } from '../../../user/domain/valueObject/username.vo';
import { EmailVO } from '../../../../shared/valueObject/email.vo';
import { PhoneNumberVO } from '../../../../shared/valueObject/phone.vo';
import { User } from '../../../user/domain/entities/user.entity';
import type { IUserRepository } from '../../../user/domain/repositories/user.repository';
import { RESERVATION_STATUS } from '../../domain/constants/reservation-status.constant';
import { CancelReservationUseCase } from './cancel-reservation.usecase';
import {
  createReservationRepositoryMock,
  createSampleReservation,
} from './reservation-test.helpers';

describe('CancelReservationUseCase', () => {
  it('annule une réservation pour son propriétaire', async () => {
    const reservation = createSampleReservation({ id: 3, userId: 5 });
    const repository = createReservationRepositoryMock({
      findById: vi.fn().mockResolvedValue(reservation),
      update: vi.fn().mockImplementation(async (updated) => updated),
    });
    const user = new User(
      new UserNameVO('Jean'),
      new UserNameVO('Dupont'),
      new EmailVO('jean@test.com'),
      new PhoneNumberVO('+33601020304'),
      '',
      5,
    );

    const useCase = new CancelReservationUseCase(
      repository,
      { findByAuthId: vi.fn().mockResolvedValue(user) } as unknown as IUserRepository,
      { findById: vi.fn() } as never,
      { findByOwnerId: vi.fn() } as never,
    );

    const result = await useCase.execute(3, {
      authId: 1,
      canCancelAll: false,
      canCancelHost: false,
    });

    expect(result.status).toBe(RESERVATION_STATUS.CANCELLED);
  });

  it('rejette si la réservation est déjà annulée', async () => {
    const reservation = createSampleReservation({
      id: 3,
      status: RESERVATION_STATUS.CANCELLED,
    });

    const useCase = new CancelReservationUseCase(
      createReservationRepositoryMock({
        findById: vi.fn().mockResolvedValue(reservation),
      }),
      { findByAuthId: vi.fn() } as unknown as IUserRepository,
      { findById: vi.fn() } as never,
      { findByOwnerId: vi.fn() } as never,
    );

    await expect(
      useCase.execute(3, {
        authId: 1,
        canCancelAll: false,
        canCancelHost: false,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('refuse l’annulation par un autre utilisateur', async () => {
    const reservation = createSampleReservation({ id: 3, userId: 5 });
    const user = new User(
      new UserNameVO('Alice'),
      new UserNameVO('Martin'),
      new EmailVO('alice@test.com'),
      new PhoneNumberVO('+33601020304'),
      '',
      6,
    );

    const useCase = new CancelReservationUseCase(
      createReservationRepositoryMock({
        findById: vi.fn().mockResolvedValue(reservation),
      }),
      { findByAuthId: vi.fn().mockResolvedValue(user) } as unknown as IUserRepository,
      { findById: vi.fn() } as never,
      { findByOwnerId: vi.fn() } as never,
    );

    await expect(
      useCase.execute(3, {
        authId: 2,
        canCancelAll: false,
        canCancelHost: false,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
