import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RESERVATION_STATUS } from '../../../domain/constants/reservation-status.constant';
import { BookingOrderItemOutput } from '../../dto/booking-order-item.output';
import { GetBookingOrderQueryHandler } from './GetBookingOrderQueryHandler';
import { GetBookingOrderQuery } from '../queries/GetBookingOrderQuery';

describe('GetBookingOrderQueryHandler', () => {
  const paymentRepository = { findById: vi.fn() };
  const userRepository = { findById: vi.fn(), findByAuthId: vi.fn() };
  const propertyRepository = { findAllByOwnerId: vi.fn() };
  const resolvePaymentReservations = { resolveBookingItemsForPayment: vi.fn() };

  let handler: GetBookingOrderQueryHandler;

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
    paymentRepository.findById.mockResolvedValue({
      id: 7,
      userId: 3,
      amount: 513,
      currency: 'EUR',
      status: 'succeeded',
      transactionId: 'pi_test',
      createdAt: new Date('2026-07-02'),
    });
    userRepository.findById.mockResolvedValue({
      id: 3,
      firstName: 'Test',
      lastName: 'Test',
      email: 'test@test.test',
    });
    resolvePaymentReservations.resolveBookingItemsForPayment.mockResolvedValue([
      bookingItem,
    ]);
    handler = new GetBookingOrderQueryHandler(
      paymentRepository as never,
      userRepository as never,
      propertyRepository as never,
      resolvePaymentReservations as never,
    );
  });

  it('retourne les séjours avec status et userId', async () => {
    const result = await handler.execute(
      new GetBookingOrderQuery(7, {
        canReadAll: true,
        canReadHost: false,
        authId: 0,
      }),
    );

    expect(result.items).toHaveLength(1);
    expect(result.items[0].status).toBe(RESERVATION_STATUS.CONFIRMED);
    expect(result.items[0].userId).toBe(3);
    expect(result.items[0].roomName).toBe('Chambre A');
    expect(result.itemCount).toBe(1);
  });
});
