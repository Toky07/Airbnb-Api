import type { IInvoiceRepository } from './domain/repositories/invoice.repository';
import type { IUserRepository } from '../user/domain/repositories/user.repository';
import { GenerateInvoicePdfService } from './applications/services/generate-invoice-pdf.service';
import type { InvoiceStorageService } from './infrastructure/storage/invoice-storage.service';
import { InvoiceNumberService } from './applications/services/invoice-number.service';
import { CreateInvoiceCommandHandler } from './applications/useCase/handlers/CreateInvoiceCommandHandler';
import { ListMyInvoicesQueryHandler } from './applications/useCase/handlers/ListMyInvoicesQueryHandler';
import { ListInvoicesQueryHandler } from './applications/useCase/handlers/ListInvoicesQueryHandler';
import { DownloadInvoiceQueryHandler } from './applications/useCase/handlers/DownloadInvoiceQueryHandler';

export class InvoiceBootstrap {
  static create(deps: {
    invoiceRepository: IInvoiceRepository;
    generateInvoicePdf: GenerateInvoicePdfService;
    invoiceStorage: InvoiceStorageService;
    invoiceNumberService: InvoiceNumberService;
    userRepository: IUserRepository;
  }) {
    return {
      createInvoiceCommandHandler: new CreateInvoiceCommandHandler(
        deps.invoiceRepository,
        deps.generateInvoicePdf,
        deps.invoiceStorage,
      ),
      listMyInvoicesQueryHandler: new ListMyInvoicesQueryHandler(
        deps.invoiceRepository,
        deps.userRepository,
      ),
      listInvoicesQueryHandler: new ListInvoicesQueryHandler(
        deps.invoiceRepository,
      ),
      downloadInvoiceQueryHandler: new DownloadInvoiceQueryHandler(
        deps.invoiceRepository,
        deps.userRepository,
      ),
      invoiceNumberService: deps.invoiceNumberService,
    };
  }
}
