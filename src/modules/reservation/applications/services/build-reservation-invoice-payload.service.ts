import { Inject, Injectable } from '@nestjs/common';
import type { Payment } from '../../../payment/domain/entities/payment.entity';
import {
  ROOM_REPOSITORY,
  type IRoomRepository,
} from '../../../rooms/domain/repositories/room.repository';
import type { IUserRepository } from '../../../user/domain/repositories/user.repository';
import { USER_REPOSITORY } from '../../../user/infrastructure/repositories/user.repository';
import { InvoiceGenerateRequestedEvent } from '../../../invoice/domain/events/invoice-generate-requested.event';
import { INVOICE_PAYMENT_TYPE } from '../../../invoice/domain/constants/invoice-payment-type.constant';
import type {
  InvoiceData,
  InvoiceLineItem,
  InvoiceTotals,
} from '../../../invoice/domain/types/invoice-data.type';
import { getInvoiceIssuer } from '../../../invoice/domain/constants/invoice-source.constant';
import { InvoiceNumberService } from '../../../invoice/applications/services/invoice-number.service';
import type {
  HostPaymentNotificationGroup,
  ReservationInvoiceContext,
  ReservationInvoiceLineItem,
} from '../../domain/types/reservation-invoice-context.type';
import { ResolvePaymentReservationsService } from './resolve-payment-reservations.service';
import { formatInvoiceDate } from '../utils/format-invoice.util';
import { ReservationItemOutput } from '../dto/reservation-item.output';

@Injectable()
export class BuildReservationInvoicePayloadService {
  constructor(
    private readonly resolvePaymentReservations: ResolvePaymentReservationsService,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
    private readonly invoiceNumberService: InvoiceNumberService,
  ) {}

  async execute(payment: Payment): Promise<ReservationInvoiceContext | null> {
    if (!payment.id) {
      return null;
    }

    const [items, customer] = await Promise.all([
      this.resolvePaymentReservations.resolveForPayment(payment),
      this.userRepository.findById(payment.userId),
    ]);

    if (!customer) return null;

    const lineItems = await this.buildLineItems(items);

    if (!lineItems) {
      return null;
    }

    const paidAt = payment.updatedAt ?? payment.createdAt ?? new Date();
    const invoiceNumber = await this.invoiceNumberService.generate(paidAt);
    const totals = this.resolveTotals(payment);

    return {
      paymentId: payment.id,
      invoiceNumber,
      transactionId: payment.transactionId ?? '',
      paidAt,
      amountCents: payment.amount,
      currency: payment.currency,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phoneNumber,
      lineItems,
      totals,
    };
  }

  toInvoiceGenerateEvent(
    payment: Payment,
    context: ReservationInvoiceContext,
  ): InvoiceGenerateRequestedEvent {
    return new InvoiceGenerateRequestedEvent(
      payment.userId,
      INVOICE_PAYMENT_TYPE.RESERVATION,
      context.paymentId,
      this.toInvoiceData(context),
    );
  }

  toInvoiceData(context: ReservationInvoiceContext): InvoiceData {
    const issuer = getInvoiceIssuer();
    const totals = context.totals ?? this.fallbackTotals(context.amountCents);
    const items = this.buildInvoiceItems(context.lineItems, totals);

    return {
      invoiceNumber: context.invoiceNumber,
      paidAt: context.paidAt,
      currency: context.currency,
      totalCents: totals.totalCents,
      recipient: {
        name: context.customerName,
        email: context.customerEmail,
        phone: context.customerPhone || undefined,
      },
      references: [
        { label: 'Stripe', value: context.transactionId },
        { label: 'Paiement', value: `#${context.paymentId}` },
      ],
      items,
      issuer,
      totals,
    };
  }

  async buildHostNotificationGroups(
    context: ReservationInvoiceContext,
  ): Promise<HostPaymentNotificationGroup[]> {
    const grouped = new Map<number, ReservationInvoiceLineItem[]>();

    for (const item of context.lineItems) {
      const current = grouped.get(item.propertyOwnerId) ?? [];
      current.push(item);
      grouped.set(item.propertyOwnerId, current);
    }

    const groups: HostPaymentNotificationGroup[] = [];

    for (const [ownerId, items] of grouped.entries()) {
      const owner = await this.userRepository.findById(ownerId);
      if (!owner?.email) {
        continue;
      }

      groups.push({
        ownerId,
        ownerEmail: owner.email,
        ownerName: owner.name,
        items,
      });
    }

    return groups;
  }

  private resolveTotals(payment: Payment): InvoiceTotals {
    const breakdown = payment.pricingBreakdown;
    if (breakdown) {
      return {
        subtotalCents: breakdown.subtotalCents,
        vatCents: breakdown.vatCents,
        touristTaxCents: breakdown.touristTaxCents,
        serviceFeeCents: breakdown.serviceFeeCents,
        totalCents: breakdown.totalCents,
      };
    }

    return this.fallbackTotals(payment.amount);
  }

  private fallbackTotals(totalCents: number): InvoiceTotals {
    return {
      subtotalCents: totalCents,
      vatCents: 0,
      touristTaxCents: 0,
      serviceFeeCents: 0,
      totalCents,
    };
  }

  private buildInvoiceItems(
    lineItems: ReservationInvoiceLineItem[],
    totals: InvoiceTotals,
  ): InvoiceLineItem[] {
    const accommodationItems = lineItems.map((item) => ({
      label: item.roomName,
      subtitle:
        [item.propertyName, item.propertyCity].filter(Boolean).join(' · ') ||
        undefined,
      quantity: item.nights,
      unitPriceCents: Math.round(item.unitPrice * 100),
      totalPriceCents: Math.round(item.totalPrice * 100),
      columns: {
        dates: `${formatInvoiceDate(item.startDate, { day: '2-digit', month: 'short' })} → ${formatInvoiceDate(item.endDate, { day: '2-digit', month: 'short', year: 'numeric' })}`,
        guests: item.guestCount,
        nights: item.nights,
      },
    }));

    const feeItems: InvoiceLineItem[] = [];

    if (totals.vatCents > 0) {
      feeItems.push({
        label: 'TVA',
        quantity: 1,
        unitPriceCents: totals.vatCents,
        totalPriceCents: totals.vatCents,
      });
    }

    if (totals.touristTaxCents > 0) {
      feeItems.push({
        label: 'Taxe de séjour',
        quantity: 1,
        unitPriceCents: totals.touristTaxCents,
        totalPriceCents: totals.touristTaxCents,
      });
    }

    if (totals.serviceFeeCents > 0) {
      feeItems.push({
        label: 'Frais de service',
        quantity: 1,
        unitPriceCents: totals.serviceFeeCents,
        totalPriceCents: totals.serviceFeeCents,
      });
    }

    return [...accommodationItems, ...feeItems];
  }

  private async buildLineItems(
    items: ReservationItemOutput[],
  ): Promise<ReservationInvoiceLineItem[] | null> {
    if (items.length === 0) {
      return null;
    }

    const lineItems: ReservationInvoiceLineItem[] = [];

    for (const item of items) {
      const room = await this.roomRepository.findById(item.roomId);
      if (!room) {
        continue;
      }

      const unitPrice =
        item.nights > 0
          ? Math.round((item.price / item.nights) * 100) / 100
          : item.price;

      lineItems.push({
        reservationId: item.id,
        roomName: item.roomName ?? room.name,
        propertyName: item.propertyName ?? room.property.name,
        propertyCity: item.propertyCity ?? room.property.city,
        propertyAddress: room.property.address,
        propertyCountry: room.property.country,
        startDate: item.startDate,
        endDate: item.endDate,
        guestCount: item.guestCount,
        nights: item.nights,
        unitPrice,
        totalPrice: item.price,
        propertyOwnerId: room.property.ownerId,
      });
    }

    return lineItems;
  }
}
