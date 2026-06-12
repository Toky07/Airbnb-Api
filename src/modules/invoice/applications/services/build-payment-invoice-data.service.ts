import { Inject, Injectable } from '@nestjs/common';
import type { Payment } from '../../../payment/domain/entities/payment.entity';
import {
  ROOM_REPOSITORY,
  type IRoomRepository,
} from '../../../rooms/domain/repositories/room.repository';
import { ResolvePaymentReservationsService } from '../../../reservation/applications/services/resolve-payment-reservations.service';
import type { IUserRepository } from '../../../user/domain/repositories/user.repository';
import { USER_REPOSITORY } from '../../../user/infrastructure/repositories/user.repository';
import type {
  HostPaymentNotificationGroup,
  PaymentInvoiceData,
  PaymentInvoiceLineItem,
} from '../../domain/types/payment-invoice-data.type';
import {
  buildInvoiceNumber,
} from '../utils/format-invoice.util';

@Injectable()
export class BuildPaymentInvoiceDataService {
  constructor(
    private readonly resolvePaymentReservations: ResolvePaymentReservationsService,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
  ) {}

  async execute(payment: Payment): Promise<PaymentInvoiceData | null> {
    if (!payment.id) {
      return null;
    }

    const [items, customer] = await Promise.all([
      this.resolvePaymentReservations.resolveForPayment(payment),
      this.userRepository.findById(payment.userId),
    ]);

    if (items.length === 0 || !customer) {
      return null;
    }

    const lineItems: PaymentInvoiceLineItem[] = [];

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

    if (lineItems.length === 0) {
      return null;
    }

    const paidAt = payment.updatedAt ?? payment.createdAt ?? new Date();

    return {
      paymentId: payment.id,
      invoiceNumber: buildInvoiceNumber(payment.id, paidAt),
      transactionId: payment.transactionId,
      paidAt,
      amountCents: payment.amount,
      currency: payment.currency,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phoneNumber,
      lineItems,
    };
  }

  async buildHostNotificationGroups(
    data: PaymentInvoiceData,
  ): Promise<HostPaymentNotificationGroup[]> {
    const grouped = new Map<number, PaymentInvoiceLineItem[]>();

    for (const item of data.lineItems) {
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
}
