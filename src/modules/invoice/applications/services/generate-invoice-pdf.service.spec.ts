import { describe, expect, it } from 'vitest';
import { GenerateInvoicePdfService } from './generate-invoice-pdf.service';
import { createSampleInvoiceData } from '../useCase/invoice-test.helpers';

describe('GenerateInvoicePdfService', () => {
  it('génère un PDF valide avec les informations de facture', async () => {
    const service = new GenerateInvoicePdfService();
    const buffer = await service.execute(createSampleInvoiceData());

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(1000);
    expect(buffer.subarray(0, 4).toString()).toBe('%PDF');
  });

  it('supporte plusieurs lignes de séjour', async () => {
    const service = new GenerateInvoicePdfService();
    const buffer = await service.execute(
      createSampleInvoiceData({
        amountCents: 52000,
        lineItems: [
          createSampleInvoiceData().lineItems[0]!,
          {
            ...createSampleInvoiceData().lineItems[0]!,
            reservationId: 8,
            roomName: 'Chambre Standard',
            totalPrice: 200,
            unitPrice: 100,
            nights: 2,
          },
        ],
      }),
    );

    expect(buffer.subarray(0, 4).toString()).toBe('%PDF');
  });
});
