import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildPaginationMeta } from '@src/shared/pagination/pagination.types';
import { RESERVATION_STATUS } from '@src/modules/reservation/domain/constants/reservation-status.constant';
import { BookingOrderItemOutput } from '@src/modules/reservation/applications/dto/booking-order-item.output';
import { ListBookingOrdersQueryHandler } from './ListBookingOrdersQueryHandler';
import { ListBookingOrdersQuery } from '@src/modules/reservation/applications/useCase/queries/ListBookingOrdersQuery';

describe('ListBookingOrdersQueryHandler', () => {
  const paymentRepository = { findPaginated: vi.fn() };
  const userRepository = { findById: vi.fn() };
  const resolvePaymentReservations = { resolveForPayments: vi.fn() };

  let handler: ListBookingOrdersQueryHandler;

  const bookingItem = new BookingOrderItemOutput(
    1,
    10,
    5,
    3,
    '2026-07-10',
    '2026-07-13',
    '2026-07-10',
    '2026-07-13',
    2,
    171,
    3,
    RESERVATION_STATUS.CONFIRMED,
    'Chambre A',
    'chambre-a',
    1,
    'Hôtel Test',
    'Paris',
    null,
    new Date('2026-07-02'),
    new Date('2026-07-02'),
  );

  beforeEach(() => {
    vi.clearAllMocks();
    paymentRepository.findPaginated.mockResolvedValue({
      data: [
        {
          id: 7,
          userId: 3,
          amount: 513,
          currency: 'EUR',
          status: 'succeeded',
          transactionId: 'pi_test',
          createdAt: new Date('2026-07-02'),
        },
      ],
      meta: buildPaginationMeta(1, 1, 10),
    });
    userRepository.findById.mockResolvedValue({
      id: 3,
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean@test.com',
    });
    resolvePaymentReservations.resolveForPayments.mockResolvedValue(
      new Map([[7, [bookingItem]]]),
    );
    handler = new ListBookingOrdersQueryHandler(
      paymentRepository as never,
      userRepository as never,
      resolvePaymentReservations as never,
    );
  });

  it('builds booking order page with user and items', async () => {
    const result = await handler.execute(
      new ListBookingOrdersQuery({ page: 1, limit: 10 }),
    );

    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.paymentId).toBe(7);
    expect(result.data[0]?.itemCount).toBe(1);
    expect(result.meta.total).toBe(1);
  });

  it('scopes items by property ids when provided', async () => {
    const otherPropertyItem = new BookingOrderItemOutput(
      2,
      11,
      6,
      4,
      '2026-08-01',
      '2026-08-04',
      '2026-08-01',
      '2026-08-04',
      1,
      120,
      2,
      RESERVATION_STATUS.CONFIRMED,
      'Chambre B',
      'chambre-b',
      2,
      'Autre hôtel',
      'Lyon',
      null,
      new Date('2026-07-02'),
      new Date('2026-07-02'),
    );

    resolvePaymentReservations.resolveForPayments.mockResolvedValue(
      new Map([[7, [bookingItem, otherPropertyItem]]]),
    );

    const result = await handler.buildPage(
      {
        data: [
          {
            id: 7,
            userId: 3,
            amount: 513,
            currency: 'EUR',
            status: 'succeeded',
            transactionId: 'pi_test',
            createdAt: new Date('2026-07-02'),
          },
        ],
        meta: buildPaginationMeta(1, 1, 10),
      },
      { propertyIds: [1] },
    );

    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.propertyId).toBe(1);
  });
});
