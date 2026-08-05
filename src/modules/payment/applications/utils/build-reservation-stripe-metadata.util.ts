import { STRIPE_METADATA_KEYS } from '../../domain/constants/stripe-metadata-keys.constant';
import { PAYMENT_TYPE } from '../../domain/types/payment.type';
import type { ReservationPaymentContext } from '../../domain/types/reservation-payment-context.type';

export function buildReservationStripeMetadata(
  userId: number,
  context: ReservationPaymentContext,
): Record<string, string> {
  return {
    [STRIPE_METADATA_KEYS.USER_ID]: userId.toString(),
    [STRIPE_METADATA_KEYS.PROPERTY_TYPE]: PAYMENT_TYPE.RESERVATION,
    [STRIPE_METADATA_KEYS.RESERVATION_ID]: context.reservationId.toString(),
    [STRIPE_METADATA_KEYS.PROPERTY_ID]: context.propertyIds.join(','),
    [STRIPE_METADATA_KEYS.ROOM_IDS]: context.roomIds.join(','),
    [STRIPE_METADATA_KEYS.CHECK_IN]: context.checkIn,
    [STRIPE_METADATA_KEYS.CHECK_OUT]: context.checkOut,
  };
}
