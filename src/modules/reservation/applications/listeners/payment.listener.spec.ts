import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PaymentListener } from './payment.listener';
import {
  PAYMENT_TYPE,
  PaymentCreatedEvent,
} from '@src/modules/payment/contracts';
import type { IReservationRepository } from '@src/modules/reservation/domain/repositories/reservation.repository';
import { EventBus } from '@src/shared/domain/event.bus';

describe('PaymentListener', () => {
  beforeEach(() => {
    EventBus.getInstance().clear();
  });

  it('links payment id to reservation on payment.created', async () => {
    const reservation = { id: 10, paymentId: null };
    const reservationRepository = {
      findById: vi.fn().mockResolvedValue(reservation),
      setPayment: vi.fn().mockResolvedValue(undefined),
    } as unknown as IReservationRepository;

    const listener = new PaymentListener(reservationRepository);
    await listener.listen();

    await EventBus.getInstance().publish(
      new PaymentCreatedEvent(55, PAYMENT_TYPE.RESERVATION, 10),
    );

    expect(reservationRepository.findById).toHaveBeenCalledWith(10);
    expect(reservationRepository.setPayment).toHaveBeenCalledWith(
      reservation,
      55,
    );
    expect(reservation.paymentId).toBe(55);
  });
});
