import { describe, expect, it } from 'vitest';
import { BuildCustomerInvoiceEmailBodyService } from './build-customer-invoice-email-body.service';
import { createSampleInvoiceData } from '../useCase/invoice-test.helpers';

describe('BuildCustomerInvoiceEmailBodyService', () => {
  it('génère un email HTML avec les informations de paiement', () => {
    const service = new BuildCustomerInvoiceEmailBodyService();
    const html = service.execute(createSampleInvoiceData());

    expect(html).toContain('Paiement confirmé');
    expect(html).toContain('FACT-2026-000042');
    expect(html).toContain('Jean Dupont');
    expect(html).toContain('Suite Deluxe');
  });
});
