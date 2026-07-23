import { describe, expect, it, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { RESERVATION_STATUS } from '../../../domain/constants/reservation-status.constant';
import { MarkReservationNoShowCommandHandler } from './MarkReservationNoShowCommandHandler';
import { MarkReservationNoShowCommand } from '../commands/MarkReservationNoShowCommand';
import {
  createReservationRepositoryMock,
  createSampleReservation,
  createSampleReservationItem,
} from '../reservation-test.helpers';

describe('MarkReservationNoShowCommandHandler', () => {
  it('marque une réservation confirmée en no-show', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-10T12:00:00.000Z'));

    const reservation = createSampleReservation({
      id: 4,
      status: RESERVATION_STATUS.CONFIRMED,
      items: [
        createSampleReservationItem({
          checkIn: '2026-09-10',
          checkOut: '2026-09-12',
        }),
      ],
    });

    const handler = new MarkReservationNoShowCommandHandler(
      createReservationRepositoryMock({
        findById: vi.fn().mockResolvedValue(reservation),
        update: vi.fn().mockImplementation(async (updated) => updated),
      }),
      {
        findByAuthId: vi.fn().mockResolvedValue({ id: 5 }),
      } as never,
      {
        findById: vi.fn().mockResolvedValue({ property: { id: 3 } }),
      } as never,
      {
        findAllByOwnerId: vi.fn().mockResolvedValue([{ id: 3 }]),
      } as never,
      {
        enrich: vi.fn().mockImplementation(async (outputs) => outputs),
      } as never,
    );

    const result = await handler.execute(
      new MarkReservationNoShowCommand(4, 99),
    );
    expect(result.status).toBe(RESERVATION_STATUS.NO_SHOW);

    vi.useRealTimers();
  });

  it('rejette un no-show avant le jour d’arrivée', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-09T12:00:00.000Z'));

    const reservation = createSampleReservation({
      id: 4,
      status: RESERVATION_STATUS.CONFIRMED,
      items: [
        createSampleReservationItem({
          checkIn: '2026-09-10',
          checkOut: '2026-09-12',
        }),
      ],
    });

    const handler = new MarkReservationNoShowCommandHandler(
      createReservationRepositoryMock({
        findById: vi.fn().mockResolvedValue(reservation),
      }),
      {
        findByAuthId: vi.fn().mockResolvedValue({ id: 5 }),
      } as never,
      {
        findById: vi.fn().mockResolvedValue({ property: { id: 3 } }),
      } as never,
      {
        findAllByOwnerId: vi.fn().mockResolvedValue([{ id: 3 }]),
      } as never,
      {
        enrich: vi.fn(),
      } as never,
    );

    await expect(
      handler.execute(new MarkReservationNoShowCommand(4, 99)),
    ).rejects.toBeInstanceOf(BadRequestException);

    vi.useRealTimers();
  });
});
