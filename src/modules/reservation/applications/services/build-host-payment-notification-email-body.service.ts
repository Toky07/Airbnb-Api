import { Injectable } from '@nestjs/common';
import { RESERVATION_NOTIFICATION_BRAND } from '../../domain/constants/reservation-notification.constant';
import type {
  HostPaymentNotificationGroup,
  ReservationInvoiceContext,
} from '../../domain/types/reservation-invoice-context.type';
import {
  formatInvoiceAmount,
  formatInvoiceDate,
} from '../utils/format-invoice.util';

@Injectable()
export class BuildHostPaymentNotificationEmailBodyService {
  execute(
    data: ReservationInvoiceContext,
    group: HostPaymentNotificationGroup,
  ): string {
    const totalGroupAmount = group.items.reduce(
      (sum, item) => sum + Math.round(item.totalPrice * 100),
      0,
    );

    const itemsHtml = group.items
      .map(
        (item) => `
          <tr>
            <td style="padding:14px 16px;border-bottom:1px solid #F3F4F6;">
              <strong style="color:#111827;">${escapeHtml(item.roomName)}</strong><br/>
              <span style="font-size:13px;color:#6B7280;">${escapeHtml(item.propertyName)}${item.propertyCity ? ` &middot; ${escapeHtml(item.propertyCity)}` : ''}</span>
            </td>
            <td style="padding:14px 16px;border-bottom:1px solid #F3F4F6;font-size:14px;color:#374151;">
              ${formatInvoiceDate(item.startDate, { day: '2-digit', month: 'short' })} &rarr; ${formatInvoiceDate(item.endDate, { day: '2-digit', month: 'short', year: 'numeric' })}
            </td>
            <td style="padding:14px 16px;border-bottom:1px solid #F3F4F6;text-align:center;font-size:14px;color:#374151;">
              ${item.guestCount}
            </td>
            <td style="padding:14px 16px;border-bottom:1px solid #F3F4F6;font-size:14px;text-align:center;color:#374151;">
              ${item.nights}
            </td>
            <td style="padding:14px 16px;border-bottom:1px solid #F3F4F6;text-align:right;font-weight:600;color:#111827;">
              ${formatInvoiceAmount(Math.round(item.totalPrice * 100), data.currency)}
            </td>
          </tr>`,
      )
      .join('');

    const customerPhoneRow = data.customerPhone
      ? `<tr>
           <td style="padding:6px 0;color:#6B7280;font-size:13px;width:140px;">T\u00e9l\u00e9phone</td>
           <td style="padding:6px 0;font-size:14px;color:#111827;">${escapeHtml(data.customerPhone)}</td>
         </tr>`
      : '';

    return `
      <!DOCTYPE html>
      <html lang="fr">
        <body style="margin:0;padding:0;background:#F9FAFB;font-family:Arial,sans-serif;color:#111827;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F9FAFB;padding:24px 0;">
            <tr>
              <td align="center">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
                  <tr>
                    <td style="background:#059669;padding:28px 32px;color:#FFFFFF;">
                      <div style="font-size:24px;font-weight:700;">${RESERVATION_NOTIFICATION_BRAND.name}</div>
                      <div style="margin-top:8px;font-size:15px;opacity:0.9;">Nouvelle r\u00e9servation</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:32px;">
                      <p style="margin:0 0 12px;font-size:16px;">Bonjour ${escapeHtml(group.ownerName)},</p>
                      <p style="margin:0 0 24px;line-height:1.6;color:#374151;">
                        Une nouvelle r\u00e9servation vient d\u2019\u00eatre confirm\u00e9e et pay\u00e9e sur votre \u00e9tablissement.
                      </p>

                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#ECFDF5;border-radius:12px;margin-bottom:24px;">
                        <tr>
                          <td style="padding:16px 20px;">
                            <div style="font-size:13px;color:#065F46;">Montant de la r\u00e9servation</div>
                            <div style="font-size:28px;font-weight:700;color:#059669;">${formatInvoiceAmount(totalGroupAmount, data.currency)}</div>
                            <div style="margin-top:8px;font-size:13px;color:#6B7280;">R\u00e9f. paiement : ${escapeHtml(data.transactionId)}</div>
                          </td>
                        </tr>
                      </table>

                      <div style="background:#F9FAFB;border-radius:12px;padding:20px;margin-bottom:24px;">
                        <div style="font-size:13px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px;">Informations client</div>
                        <table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;">
                          <tr>
                            <td style="padding:6px 0;color:#6B7280;font-size:13px;width:140px;">Nom</td>
                            <td style="padding:6px 0;font-size:14px;font-weight:600;color:#111827;">${escapeHtml(data.customerName)}</td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0;color:#6B7280;font-size:13px;width:140px;">Email</td>
                            <td style="padding:6px 0;font-size:14px;color:#111827;">${escapeHtml(data.customerEmail)}</td>
                          </tr>
                          ${customerPhoneRow}
                        </table>
                      </div>

                      <div style="font-size:13px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px;">D\u00e9tail des s\u00e9jours</div>
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                        <thead>
                          <tr style="background:#F9FAFB;">
                            <th align="left" style="padding:12px 16px;font-size:12px;color:#6B7280;font-weight:600;">Chambre</th>
                            <th align="left" style="padding:12px 16px;font-size:12px;color:#6B7280;font-weight:600;">Dates</th>
                            <th align="center" style="padding:12px 16px;font-size:12px;color:#6B7280;font-weight:600;">Voyageurs</th>
                            <th align="center" style="padding:12px 16px;font-size:12px;color:#6B7280;font-weight:600;">Nuits</th>
                            <th align="right" style="padding:12px 16px;font-size:12px;color:#6B7280;font-weight:600;">Montant</th>
                          </tr>
                        </thead>
                        <tbody>${itemsHtml}</tbody>
                      </table>

                      <p style="margin:28px 0 0;line-height:1.6;color:#374151;">
                        Connectez-vous \u00e0 votre espace h\u00f4te pour consulter le d\u00e9tail complet de la r\u00e9servation.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 32px;background:#F9FAFB;border-top:1px solid #E5E7EB;text-align:center;">
                      <span style="font-size:12px;color:#9CA3AF;">${RESERVATION_NOTIFICATION_BRAND.name} &middot; Notification automatique</span>
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
