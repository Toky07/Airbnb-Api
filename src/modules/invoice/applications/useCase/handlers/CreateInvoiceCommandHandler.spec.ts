import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventBus } from '@src/shared/domain/event.bus';
import { INVOICE_PAYMENT_TYPE } from '@src/modules/invoice/domain/constants/invoice-payment-type.constant';
import { Invoice } from '@src/modules/invoice/domain/entities/invoice.entity';
import { InvoiceCreatedEvent } from '@src/modules/invoice/domain/events/invoice-created.event';
import { GenerateInvoicePdfService } from '@src/modules/invoice/applications/services/generate-invoice-pdf.service';
import { CreateInvoiceCommandHandler } from './CreateInvoiceCommandHandler';
import { CreateInvoiceCommand } from '@src/modules/invoice/applications/useCase/commands/CreateInvoiceCommand';
import { createSampleInvoiceData } from '@src/modules/invoice/applications/useCase/invoice-test.helpers';

describe('CreateInvoiceCommandHandler', () => {
  const invoiceRepository = {
    findByPayment: vi.fn(),
    create: vi.fn(),
  };
  const generateInvoicePdf = {
    execute: vi.fn(),
  };
  const invoiceStorage = {
    savePdf: vi.fn(),
  };

  let handler: CreateInvoiceCommandHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    EventBus.getInstance()['handlers'] = new Map();

    invoiceRepository.findByPayment.mockResolvedValue(null);
    invoiceRepository.create.mockResolvedValue(
      new Invoice(
        1,
        INVOICE_PAYMENT_TYPE.RESERVATION,
        42,
        'uploads/invoices/facture.pdf',
        'FACT-2026-000042',
        9,
      ),
    );
    generateInvoicePdf.execute.mockResolvedValue(Buffer.from('%PDF-test'));
    invoiceStorage.savePdf.mockResolvedValue({
      path: 'uploads/invoices/facture-FACT-2026-000042.pdf',
      fileName: 'facture-FACT-2026-000042.pdf',
    });

    handler = new CreateInvoiceCommandHandler(
      invoiceRepository,
      generateInvoicePdf as unknown as GenerateInvoicePdfService,
      invoiceStorage,
    );
  });

  it('génère, enregistre et publie invoice.created', async () => {
    const published: InvoiceCreatedEvent[] = [];
    EventBus.getInstance().subscribe(
      'invoice.created',
      async (event: InvoiceCreatedEvent) => {
        published.push(event);
      },
    );

    await handler.execute(
      new CreateInvoiceCommand(
        1,
        INVOICE_PAYMENT_TYPE.RESERVATION,
        42,
        createSampleInvoiceData(),
      ),
    );

    expect(generateInvoicePdf.execute).toHaveBeenCalled();
    expect(invoiceRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 1,
        paymentType: INVOICE_PAYMENT_TYPE.RESERVATION,
        paymentId: 42,
        path: 'uploads/invoices/facture-FACT-2026-000042.pdf',
      }),
    );
    expect(published).toHaveLength(1);
    expect(published[0]?.invoiceNumber).toBe('FACT-2026-000042');
  });

  it('ignore la génération si une facture existe déjà', async () => {
    invoiceRepository.findByPayment.mockResolvedValue(
      new Invoice(
        1,
        INVOICE_PAYMENT_TYPE.RESERVATION,
        42,
        'uploads/invoices/existing.pdf',
        'FACT-2026-000042',
        9,
      ),
    );

    await handler.execute(
      new CreateInvoiceCommand(
        1,
        INVOICE_PAYMENT_TYPE.RESERVATION,
        42,
        createSampleInvoiceData(),
      ),
    );

    expect(generateInvoicePdf.execute).not.toHaveBeenCalled();
    expect(invoiceRepository.create).not.toHaveBeenCalled();
  });
});
