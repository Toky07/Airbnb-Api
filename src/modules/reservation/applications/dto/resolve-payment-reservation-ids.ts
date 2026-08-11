import { PAYMENT_TYPE, type Payment } from '@src/modules/payment/contracts';

export function resolvePaymentReservationIds(payment: Payment): number[] {
  const reservationId =
    payment.propertyType === PAYMENT_TYPE.RESERVATION
      ? payment.propertyId
      : null;

  if (reservationId) {
    return [reservationId];
  }

  return [];
}
