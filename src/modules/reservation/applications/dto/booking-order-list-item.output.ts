import {
  type Payment,
  type PaymentStatus,
} from '@src/modules/payment/contracts';
import type { User } from '@src/modules/user/contracts';
import type { ReservationStatus } from '@src/modules/reservation/domain/constants/reservation-status.constant';
import type { BookingOrderItemOutput } from './booking-order-item.output';
import type { ReservationItemOutput } from './reservation-item.output';

type BookingListItemSource = ReservationItemOutput | BookingOrderItemOutput;

function getItemStatus(
  item: BookingListItemSource | undefined,
): ReservationStatus | null {
  return item && 'status' in item ? item.status : null;
}

function buildPreviewLabel(items: BookingListItemSource[]): string {
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
    public readonly reservationId: number | null = null,
    public readonly reservationStatus: ReservationStatus | null = null,
    public readonly checkIn: string | null = null,
  ) {}

  static fromParts(
    payment: Payment,
    items: BookingListItemSource[],
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
      firstItem?.reservationId ?? null,
      getItemStatus(firstItem),
      firstItem?.checkIn ?? null,
    );
  }
}
