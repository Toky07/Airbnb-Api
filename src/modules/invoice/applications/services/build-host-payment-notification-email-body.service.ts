import { Injectable } from '@nestjs/common';
import type {
  HostPaymentNotificationGroup,
  PaymentInvoiceData,
} from '../../domain/types/payment-invoice-data.type';
import {
  formatInvoiceAmount,
  formatInvoiceDate,
} from '../utils/format-invoice.util';

@Injectable()
export class BuildHostPaymentNotificationEmailBodyService {
  execute(
    data: PaymentInvoiceData,
    group: HostPaymentNotificationGroup,
  ): string {
    const itemsText = group.items
      .map((item, index) => {
        return [
          `${index + 1}. ${item.roomName} · ${item.propertyName}`,
          `   Dates : ${formatInvoiceDate(item.startDate)} → ${formatInvoiceDate(item.endDate)}`,
          `   Voyageurs : ${item.guestCount} · Nuits : ${item.nights}`,
          `   Montant : ${formatInvoiceAmount(Math.round(item.totalPrice * 100), data.currency)}`,
        ].join('\n');
      })
      .join('\n\n');

    return [
      `Bonjour ${group.ownerName},`,
      '',
      'Une nouvelle réservation vient d’être confirmée et payée sur votre établissement.',
      '',
      `Client : ${data.customerName}`,
      `Email client : ${data.customerEmail}`,
      data.customerPhone ? `Téléphone client : ${data.customerPhone}` : null,
      `Référence paiement : ${data.transactionId}`,
      `Montant total du paiement : ${formatInvoiceAmount(data.amountCents, data.currency)}`,
      '',
      'Détails des séjour(s) concernés :',
      itemsText,
      '',
      'Connectez-vous à votre espace hôte pour consulter le détail complet de la réservation.',
    ]
      .filter((line): line is string => line != null)
      .join('\n');
  }
}
