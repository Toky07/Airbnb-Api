import { PAYMENT_TYPE } from '../../../payment/domain/types/payment.type';
import type { PaymentStatus } from '../../../payment/domain/constants/payment-status.constant';
import type { Payment } from '../../../payment/domain/entities/payment.entity';
import type { User } from '../../../user/domain/entities/user.entity';
import { ReservationItemOutput } from './reservation-item.output';
import { BookingOrderItemOutput } from './booking-order-item.output';

export class BookingOrderListItemOutput {
  constructor(
    public readonly paymentId: number,
    public readonly paidAt: Date,
    public readonly amount: number,
    public readonly currency: string,
    public readonly paymentStatus: PaymentStatus,
    public readonly itemCount: number,
    public readonly customerName: string,
    public readonly customerEmail: string,
    public readonly previewLabel: string,
    public readonly transactionId: string,
    public readonly startDate: string | null,
    public readonly endDate: string | null,
    public readonly propertyId: number | null = null,
    public readonly propertyName: string | null = null,
  ) {}

  static fromParts(
    payment: Payment,
    items: ReservationItemOutput[],
    user: User | null,
    scope?: { propertyId?: number | null },
  ): BookingOrderListItemOutput {
    const itemCount = items.length;
    const previewLabel = buildPreviewLabel(items);
    const firstItem = items[0];
    const scopedAmount = items.reduce((total, item) => total + item.price, 0);

    return new BookingOrderListItemOutput(
      payment.id!,
      payment.createdAt!,
      scopedAmount,
      payment.currency,
      payment.status,
      itemCount,
      user ? `${user.firstName} ${user.lastName}`.trim() : 'Client inconnu',
      user?.email ?? '—',
      previewLabel,
      payment.transactionId ?? '',
      firstItem?.startDate ?? null,
      firstItem?.endDate ?? null,
      scope?.propertyId ?? firstItem?.propertyId ?? null,
      firstItem?.propertyName ?? null,
    );
  }
}

export class BookingOrderDetailOutput {
  constructor(
    public readonly paymentId: number,
    public readonly paidAt: Date,
    public readonly amount: number,
    public readonly currency: string,
    public readonly paymentStatus: PaymentStatus,
    public readonly transactionId: string,
    public readonly customerName: string,
    public readonly customerEmail: string,
    public readonly itemCount: number,
    public readonly items: BookingOrderItemOutput[],
  ) {}

  static fromParts(
    payment: Payment,
    items: BookingOrderItemOutput[],
    user: User | null,
  ): BookingOrderDetailOutput {
    const scopedAmount = items.reduce((total, item) => total + item.price, 0);

    return new BookingOrderDetailOutput(
      payment.id!,
      payment.createdAt!,
      scopedAmount,
      payment.currency,
      payment.status,
      payment.transactionId ?? '',
      user ? `${user.firstName} ${user.lastName}`.trim() : 'Client inconnu',
      user?.email ?? '—',
      items.length,
      items,
    );
  }
}

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

function buildPreviewLabel(items: ReservationItemOutput[]): string {
  if (items.length === 0) {
    return 'Aucun séjour';
  }

  const first = items[0];
  const firstName =
    first.roomName && first.propertyName
      ? `${first.roomName} · ${first.propertyName}`
      : (first.roomName ?? `Chambre #${first.roomId}`);

  if (items.length === 1) {
    return firstName;
  }

  return `${firstName} (+${items.length - 1} autre${items.length > 2 ? 's' : ''})`;
}
