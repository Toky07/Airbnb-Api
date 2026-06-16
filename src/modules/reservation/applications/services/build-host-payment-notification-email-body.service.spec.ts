import { describe, expect, it } from 'vitest';
import { BuildHostPaymentNotificationEmailBodyService } from './build-host-payment-notification-email-body.service';
import { createSampleReservationInvoiceContext } from '../reservation-invoice-test.helpers';

describe('BuildHostPaymentNotificationEmailBodyService', () => {
  it('génère un email HTML pour le propriétaire', () => {
    const service = new BuildHostPaymentNotificationEmailBodyService();
    const data = createSampleReservationInvoiceContext();
    const body = service.execute(data, {
      ownerId: 5,
      ownerEmail: 'host@test.com',
      ownerName: 'Marie Martin',
      items: data.lineItems,
    });

    expect(body).toContain('Marie Martin');
    expect(body).toContain('Jean Dupont');
    expect(body).toContain('Suite Deluxe');
    expect(body).toContain('Hôtel Riviera');
    expect(body).not.toContain('facture');
  });
});
