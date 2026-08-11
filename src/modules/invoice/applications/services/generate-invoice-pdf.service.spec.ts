import { GenerateInvoicePdfService } from './generate-invoice-pdf.service';
import { createSampleInvoiceData } from '@src/modules/invoice/applications/useCase/invoice-test.helpers';

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
        totalCents: 52000,
        items: [
          createSampleInvoiceData().items[0],
          {
            label: 'Chambre Standard',
            subtitle: 'Hôtel Riviera · Nice',
            quantity: 2,
            unitPriceCents: 10000,
            totalPriceCents: 20000,
            columns: {
              dates: '01 juil. → 03 juil. 2026',
              guests: 2,
              nights: 2,
            },
          },
        ],
      }),
    );

    expect(buffer.subarray(0, 4).toString()).toBe('%PDF');
  });
});
