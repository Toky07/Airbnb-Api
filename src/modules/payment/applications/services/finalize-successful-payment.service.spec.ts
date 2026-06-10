import { describe, expect, it, vi } from 'vitest';
import { FinalizeSuccessfulPaymentService } from './finalize-successful-payment.service';
import { createSamplePayment } from '../useCase/payment-test.helpers';

describe('FinalizeSuccessfulPaymentService', () => {
  it('confirme les réservations, vide le panier et envoie les notifications de facture', async () => {
    const confirmReservationUseCase = {
      execute: vi.fn().mockResolvedValue(undefined),
    };
    const cartRepository = {
      clearItems: vi.fn().mockResolvedValue(undefined),
    };
    const sendPaymentInvoiceNotifications = {
      execute: vi.fn().mockResolvedValue(undefined),
    };

    const service = new FinalizeSuccessfulPaymentService(
      confirmReservationUseCase as never,
      cartRepository as never,
      sendPaymentInvoiceNotifications as never,
    );

    const payment = createSamplePayment({
      reservationId: 12,
      reservationIds: [12],
    });

    await service.execute({
      ...payment,
      cartId: 3,
      reservationIds: [12, 13],
    } as never);

    expect(confirmReservationUseCase.execute).toHaveBeenCalledTimes(2);
    expect(cartRepository.clearItems).toHaveBeenCalledWith(3);
    expect(sendPaymentInvoiceNotifications.execute).toHaveBeenCalled();
  });
});
