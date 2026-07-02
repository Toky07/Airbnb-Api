import type { IInvoiceRepository } from './domain/repositories/invoice.repository';
import { GenerateInvoicePdfService } from './applications/services/generate-invoice-pdf.service';
import type { InvoiceStorageService } from './infrastructure/storage/invoice-storage.service';
import { CreateInvoiceCommandHandler } from './applications/useCase/handlers/CreateInvoiceCommandHandler';

export class InvoiceBootstrap {
  static create(deps: {
    invoiceRepository: IInvoiceRepository;
    generateInvoicePdf: GenerateInvoicePdfService;
    invoiceStorage: InvoiceStorageService;
  }) {
    return {
      createInvoiceCommandHandler: new CreateInvoiceCommandHandler(
        deps.invoiceRepository,
        deps.generateInvoicePdf,
        deps.invoiceStorage,
      ),
    };
  }
}
