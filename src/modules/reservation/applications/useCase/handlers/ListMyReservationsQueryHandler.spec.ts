import { UnauthorizedException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildPaginationMeta } from '@src/shared/pagination/pagination.types';
import { RESERVATION_STATUS } from '@src/modules/reservation/domain/constants/reservation-status.constant';
import { User } from '@src/modules/user/contracts';
import { UserNameVO } from '@src/modules/user/contracts';
import { EmailVO } from '@src/shared/valueObject/email.vo';
import { PhoneNumberVO } from '@src/shared/valueObject/phone.vo';
import { ReservationOutput } from '@src/modules/reservation/applications/dto/reservation.output';
import { ListMyReservationsQueryHandler } from './ListMyReservationsQueryHandler';
import { ListMyReservationsQuery } from '@src/modules/reservation/applications/useCase/queries/ListMyReservationsQuery';
import { ListReservationsQuery } from '@src/modules/reservation/applications/useCase/queries/ListReservationsQuery';

describe('ListMyReservationsQueryHandler', () => {
  const userRepository = { findByAuthId: vi.fn() };
  const listReservationsQueryHandler = { execute: vi.fn() };

  let handler: ListMyReservationsQueryHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    userRepository.findByAuthId.mockResolvedValue(
      new User(
        new UserNameVO('Jean'),
        new UserNameVO('Dupont'),
        new EmailVO('jean@test.com'),
        new PhoneNumberVO('+33601020304'),
        null,
        5,
      ),
    );
    listReservationsQueryHandler.execute.mockResolvedValue({
      data: [
        new ReservationOutput(
          1,
          5,
          [],
          RESERVATION_STATUS.CONFIRMED,
          new Date('2026-07-02'),
          new Date('2026-07-02'),
        ),
      ],
      meta: buildPaginationMeta(1, 1, 10),
    });
    handler = new ListMyReservationsQueryHandler(
      userRepository as never,
      listReservationsQueryHandler as never,
    );
  });

  it('lists reservations for authenticated user', async () => {
    const result = await handler.execute(
      new ListMyReservationsQuery(10, { page: 1, limit: 10 }),
    );

    expect(userRepository.findByAuthId).toHaveBeenCalledWith(10);
    expect(listReservationsQueryHandler.execute).toHaveBeenCalledWith(
      expect.any(ListReservationsQuery),
    );
    const query = listReservationsQueryHandler.execute.mock.calls[0]?.[0];
    expect(query.params.userId).toBe(5);
    expect(result.data).toHaveLength(1);
  });

  it('throws when user is not found', async () => {
    userRepository.findByAuthId.mockResolvedValue(null);

    await expect(
      handler.execute(new ListMyReservationsQuery(10, { page: 1, limit: 10 })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
