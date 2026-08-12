import {
  type Payment,
  type PaymentStatus,
} from '@src/modules/payment/contracts';
import type { User } from '@src/modules/user/contracts';
import type { BookingOrderItemOutput } from './booking-order-item.output';

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
    public readonly invoiceId: number | null = null,
    public readonly invoiceNumber: string | null = null,
  ) {}

  static fromParts(
    payment: Payment,
    items: BookingOrderItemOutput[],
    user: User | null,
    invoice: { id: number; invoiceNumber: string } | null = null,
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
      invoice?.id ?? null,
      invoice?.invoiceNumber ?? null,
    );
  }
}
