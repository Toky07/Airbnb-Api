import { describe, expect, it, vi } from 'vitest';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import {
  createPaymentRepositoryMock,
  createSamplePayment,
} from '../../../../payment/applications/useCase/payment-test.helpers';
import { UserNameVO } from '../../../../user/domain/valueObject/username.vo';
import { EmailVO } from '../../../../../shared/valueObject/email.vo';
import { PhoneNumberVO } from '../../../../../shared/valueObject/phone.vo';
import { User } from '../../../../user/domain/entities/user.entity';
import type { IUserRepository } from '../../../../user/domain/repositories/user.repository';
import { RESERVATION_STATUS } from '../../../domain/constants/reservation-status.constant';
import { CancelReservationCommandHandler } from './CancelReservationCommandHandler';
import { CancelReservationCommand } from '../commands/CancelReservationCommand';
import {
  createReservationRepositoryMock,
  createSampleReservation,
  createSampleReservationItem,
} from '../reservation-test.helpers';

const paymentRepository = createPaymentRepositoryMock({
  findById: vi.fn().mockResolvedValue(createSamplePayment({ id: 1 })),
});

describe('CancelReservationCommandHandler', () => {
  it('annule une réservation pour son propriétaire', async () => {
    const item = createSampleReservationItem({
      id: 3,
      reservationId: 1,
      roomId: 10,
    });
    const reservation = createSampleReservation({
      id: 1,
      userId: 5,
      items: [item],
    });
    const repository = createReservationRepositoryMock({
      update: vi.fn().mockImplementation(async (updated) => updated),
      findById: vi.fn().mockResolvedValue(reservation),
    });
    const user = new User(
      new UserNameVO('Jean'),
      new UserNameVO('Dupont'),
      new EmailVO('jean@test.com'),
      new PhoneNumberVO('+33601020304'),
      '',
      5,
    );

    const handler = new CancelReservationCommandHandler(
      repository,
      {
        findByAuthId: vi.fn().mockResolvedValue(user),
      } as unknown as IUserRepository,
      paymentRepository,
    );

    const result = await handler.execute(
      new CancelReservationCommand(1, {
        authId: 1,
        canCancelAll: false,
        canCancelHost: false,
      }),
    );

    expect(result.status).toBe(RESERVATION_STATUS.CANCELLED);
  });

  it('rejette si la réservation est déjà annulée', async () => {
    const reservation = createSampleReservation({
      id: 1,
      userId: 5,
      status: RESERVATION_STATUS.CANCELLED,
    });

    const handler = new CancelReservationCommandHandler(
      createReservationRepositoryMock({
        findById: vi.fn().mockResolvedValue(reservation),
      }),
      {
        findByAuthId: vi.fn().mockResolvedValue(null),
      } as unknown as IUserRepository,
      paymentRepository,
    );

    await expect(
      handler.execute(
        new CancelReservationCommand(1, {
          authId: 1,
          canCancelAll: false,
          canCancelHost: false,
        }),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('refuse l’annulation par un autre utilisateur', async () => {
    const item = createSampleReservationItem({ id: 3, reservationId: 1 });
    const reservation = createSampleReservation({
      id: 1,
      userId: 5,
      items: [item],
    });
    const user = new User(
      new UserNameVO('Alice'),
      new UserNameVO('Martin'),
      new EmailVO('alice@test.com'),
      new PhoneNumberVO('+33601020304'),
      '',
      6,
    );

    const handler = new CancelReservationCommandHandler(
      createReservationRepositoryMock({
        findById: vi.fn().mockResolvedValue(reservation),
      }),
      {
        findByAuthId: vi.fn().mockResolvedValue(user),
      } as unknown as IUserRepository,
      paymentRepository,
    );

    await expect(
      handler.execute(
        new CancelReservationCommand(1, {
          authId: 2,
          canCancelAll: false,
          canCancelHost: false,
        }),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
