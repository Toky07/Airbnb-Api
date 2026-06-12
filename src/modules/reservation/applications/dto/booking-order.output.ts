import type { PaymentStatus } from '../../../payment/domain/constants/payment-status.constant';
import type { Payment } from '../../../payment/domain/entities/payment.entity';
import type { User } from '../../../user/domain/entities/user.entity';
import { ReservationItemOutput } from './reservation-item.output';

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
  ) {}

  static fromParts(
    payment: Payment,
    items: ReservationItemOutput[],
    user: User | null,
  ): BookingOrderListItemOutput {
    const itemCount = items.length;
    const previewLabel = buildPreviewLabel(items);
    const firstItem = items[0];

    return new BookingOrderListItemOutput(
      payment.id!,
      payment.createdAt!,
      payment.amount / 100,
      payment.currency,
      payment.status,
      itemCount,
      user ? `${user.firstName} ${user.lastName}`.trim() : 'Client inconnu',
      user?.email ?? '—',
      previewLabel,
      payment.transactionId,
      firstItem?.startDate ?? null,
      firstItem?.endDate ?? null,
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
    public readonly items: ReservationItemOutput[],
  ) {}

  static fromParts(
    payment: Payment,
    items: ReservationItemOutput[],
    user: User | null,
  ): BookingOrderDetailOutput {
    return new BookingOrderDetailOutput(
      payment.id!,
      payment.createdAt!,
      payment.amount / 100,
      payment.currency,
      payment.status,
      payment.transactionId,
      user ? `${user.firstName} ${user.lastName}`.trim() : 'Client inconnu',
      user?.email ?? '—',
      items.length,
      items,
    );
  }
}

export function resolvePaymentReservationIds(payment: Payment): number[] {
  if (payment.reservationIds.length > 0) {
    return [...new Set(payment.reservationIds.filter((id) => id > 0))];
  }

  if (payment.reservationId) {
    return [payment.reservationId];
  }

  return [];
}

function buildPreviewLabel(items: ReservationItemOutput[]): string {
  if (items.length === 0) {
    return 'Aucun séjour';
  }

  const first = items[0]!;
  const firstName =
    first.roomName && first.propertyName
      ? `${first.roomName} · ${first.propertyName}`
      : first.roomName ?? `Chambre #${first.roomId}`;

  if (items.length === 1) {
    return firstName;
  }

  return `${firstName} (+${items.length - 1} autre${items.length > 2 ? 's' : ''})`;
}
