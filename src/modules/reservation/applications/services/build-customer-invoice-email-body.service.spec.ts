import { describe, expect, it } from 'vitest';
import { BuildCustomerInvoiceEmailBodyService } from './build-customer-invoice-email-body.service';
import { createSampleReservationInvoiceContext } from '@src/modules/reservation/applications/reservation-invoice-test.helpers';

describe('BuildCustomerInvoiceEmailBodyService', () => {
  it('génère un email HTML avec les informations de paiement', () => {
    const service = new BuildCustomerInvoiceEmailBodyService();
    const html = service.execute(createSampleReservationInvoiceContext());

    expect(html).toContain('Paiement confirmé');
    expect(html).toContain('FACT-2026-000042');
    expect(html).toContain('Jean Dupont');
    expect(html).toContain('Suite Deluxe');
  });
});
