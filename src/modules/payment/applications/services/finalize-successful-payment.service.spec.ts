import { describe, expect, it, vi } from 'vitest';
import { FinalizeSuccessfulPaymentService } from './finalize-successful-payment.service';
import { createSamplePayment } from '../useCase/payment-test.helpers';

describe('FinalizeSuccessfulPaymentService', () => {
  it('confirme la réservation, vide le panier et envoie les notifications de facture', async () => {
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

    const payment = createSamplePayment({ id: 42, propertyId: 12, cartId: 3 });

    await service.execute(payment);

    expect(confirmReservationUseCase.execute).toHaveBeenCalledWith(12);
    expect(cartRepository.clearItems).toHaveBeenCalledWith(3);
    expect(sendPaymentInvoiceNotifications.execute).toHaveBeenCalledWith(payment);
  });
});
