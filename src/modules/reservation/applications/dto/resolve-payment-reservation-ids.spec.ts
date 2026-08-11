import { describe, expect, it } from 'vitest';
import { PAYMENT_TYPE, type Payment } from '@src/modules/payment/contracts';
import { createSamplePayment } from '@src/modules/payment/applications/useCase/payment-test.helpers';
import { resolvePaymentReservationIds } from './resolve-payment-reservation-ids';

describe('resolvePaymentReservationIds', () => {
  it('retourne propertyId pour un paiement de type réservation', () => {
    const payment = createSamplePayment({ propertyId: 42 });

    expect(resolvePaymentReservationIds(payment)).toEqual([42]);
  });

  it('retourne une liste vide pour un autre type de paiement', () => {
    const payment = createSamplePayment({ propertyId: 42 });
    const orderPayment = {
      ...payment,
      propertyType: PAYMENT_TYPE.ORDER,
    } as Payment;

    expect(resolvePaymentReservationIds(orderPayment)).toEqual([]);
  });
});
