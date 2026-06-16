import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventBus } from '../../../../shared/domain/event.bus';
import { InvoiceCreatedEvent } from '../../domain/events/invoice-created.event';
import type { InvoiceGenerateRequestedEvent } from '../../domain/events/invoice-generate-requested.event';
import { Invoice } from '../../domain/entities/invoice.entity';
import {
  INVOICE_REPOSITORY,
  type IInvoiceRepository,
} from '../../domain/repositories/invoice.repository';
import { GenerateInvoicePdfService } from '../services/generate-invoice-pdf.service';
import { InvoiceStorageService } from '../../infrastructure/storage/invoice-storage.service';

@Injectable()
export class CreateInvoiceUseCase {
  private readonly logger = new Logger(CreateInvoiceUseCase.name);

  constructor(
    @Inject(INVOICE_REPOSITORY)
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly generateInvoicePdf: GenerateInvoicePdfService,
    private readonly invoiceStorage: InvoiceStorageService,
  ) {}

  async execute(event: InvoiceGenerateRequestedEvent): Promise<void> {
    const existing = await this.invoiceRepository.findByPayment(
      event.paymentType,
      event.paymentId,
    );

    if (existing?.id) {
      this.logger.debug(
        `Facture déjà existante pour ${event.paymentType} #${event.paymentId}.`,
      );
      return;
    }

    const pdfBuffer = await this.generateInvoicePdf.execute(event.data);
    const stored = await this.invoiceStorage.savePdf(
      event.data.invoiceNumber,
      pdfBuffer,
    );

    const invoice = await this.invoiceRepository.create(
      new Invoice(
        event.userId,
        event.paymentType,
        event.paymentId,
        stored.path,
        event.data.invoiceNumber,
      ),
    );

    if (!invoice.id) {
      this.logger.error(
        `Impossible d'enregistrer la facture pour ${event.paymentType} #${event.paymentId}.`,
      );
      return;
    }

    await EventBus.getInstance().publish(
      new InvoiceCreatedEvent(
        invoice.id,
        invoice.userId,
        invoice.paymentType,
        invoice.paymentId,
        invoice.path,
        invoice.invoiceNumber,
        stored.fileName,
      ),
    );
  }
}
