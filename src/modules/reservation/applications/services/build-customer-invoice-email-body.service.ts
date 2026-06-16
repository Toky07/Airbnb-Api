import { Injectable } from '@nestjs/common';
import { RESERVATION_NOTIFICATION_BRAND } from '../../domain/constants/reservation-notification.constant';
import type { ReservationInvoiceContext } from '../../domain/types/reservation-invoice-context.type';
import {
  formatInvoiceAmount,
  formatInvoiceDate,
} from '../utils/format-invoice.util';

@Injectable()
export class BuildCustomerInvoiceEmailBodyService {
  execute(data: ReservationInvoiceContext): string {
    const itemsHtml = data.lineItems
      .map(
        (item) => `
          <tr>
            <td style="padding:12px;border-bottom:1px solid #F3F4F6;">
              <strong>${escapeHtml(item.roomName)}</strong><br/>
              <span style="color:#6B7280;">${escapeHtml(item.propertyName)}${item.propertyCity ? ` · ${escapeHtml(item.propertyCity)}` : ''}</span>
            </td>
            <td style="padding:12px;border-bottom:1px solid #F3F4F6;">
              ${formatInvoiceDate(item.startDate, { day: '2-digit', month: 'short' })} → ${formatInvoiceDate(item.endDate, { day: '2-digit', month: 'short', year: 'numeric' })}
            </td>
            <td style="padding:12px;border-bottom:1px solid #F3F4F6;">${item.guestCount}</td>
            <td style="padding:12px;border-bottom:1px solid #F3F4F6;text-align:right;">
              ${formatInvoiceAmount(Math.round(item.totalPrice * 100), data.currency)}
            </td>
          </tr>
        `,
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html lang="fr">
        <body style="margin:0;padding:0;background:#F9FAFB;font-family:Arial,sans-serif;color:#111827;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F9FAFB;padding:24px 0;">
            <tr>
              <td align="center">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
                  <tr>
                    <td style="background:${RESERVATION_NOTIFICATION_BRAND.color};padding:28px 32px;color:#FFFFFF;">
                      <div style="font-size:24px;font-weight:700;">${RESERVATION_NOTIFICATION_BRAND.name}</div>
                      <div style="margin-top:8px;font-size:15px;">Paiement confirmé</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:32px;">
                      <p style="margin:0 0 12px;font-size:16px;">Bonjour ${escapeHtml(data.customerName)},</p>
                      <p style="margin:0 0 24px;line-height:1.6;color:#374151;">
                        Votre paiement a bien été confirmé. Vous trouverez votre facture <strong>${escapeHtml(data.invoiceNumber)}</strong> en pièce jointe.
                      </p>
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#FFF1F2;border-radius:12px;margin-bottom:24px;">
                        <tr>
                          <td style="padding:16px 20px;">
                            <div style="font-size:13px;color:#9F1239;">Montant payé</div>
                            <div style="font-size:28px;font-weight:700;color:${RESERVATION_NOTIFICATION_BRAND.color};">${formatInvoiceAmount(data.amountCents, data.currency)}</div>
                            <div style="margin-top:8px;font-size:13px;color:#6B7280;">Référence : ${escapeHtml(data.transactionId)}</div>
                          </td>
                        </tr>
                      </table>
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                        <thead>
                          <tr style="background:#F9FAFB;">
                            <th align="left" style="padding:12px;font-size:12px;color:#6B7280;">Séjour</th>
                            <th align="left" style="padding:12px;font-size:12px;color:#6B7280;">Dates</th>
                            <th align="left" style="padding:12px;font-size:12px;color:#6B7280;">Voyageurs</th>
                            <th align="right" style="padding:12px;font-size:12px;color:#6B7280;">Montant</th>
                          </tr>
                        </thead>
                        <tbody>${itemsHtml}</tbody>
                      </table>
                      <p style="margin:24px 0 0;line-height:1.6;color:#374151;">
                        Merci pour votre réservation. Nous vous souhaitons un excellent séjour.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `.trim();
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
