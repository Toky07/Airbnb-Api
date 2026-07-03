import { Logger } from '@nestjs/common';
import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import { EventBus } from '../../../../../shared/domain/event.bus';
import { InvoiceCreatedEvent } from '../../../domain/events/invoice-created.event';
import { Invoice } from '../../../domain/entities/invoice.entity';
import type { IInvoiceRepository } from '../../../domain/repositories/invoice.repository';
import type { GenerateInvoicePdfService } from '../../services/generate-invoice-pdf.service';
import type { InvoiceStorageService } from '../../../infrastructure/storage/invoice-storage.service';
import type { CreateInvoiceCommand } from '../commands/CreateInvoiceCommand';

export class CreateInvoiceCommandHandler implements ICommandHandler<
  CreateInvoiceCommand,
  void
> {
  private readonly logger = new Logger(CreateInvoiceCommandHandler.name);

  constructor(
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly generateInvoicePdf: GenerateInvoicePdfService,
    private readonly invoiceStorage: InvoiceStorageService,
  ) {}

  async execute(command: CreateInvoiceCommand): Promise<void> {
    const existing = await this.invoiceRepository.findByPayment(
      command.paymentType,
      command.paymentId,
    );

    if (existing?.id) {
      this.logger.debug(
        `Facture déjà existante pour ${command.paymentType} #${command.paymentId}.`,
      );
      return;
    }

    const pdfBuffer = await this.generateInvoicePdf.execute(command.data);
    const stored = await this.invoiceStorage.savePdf(
      command.data.invoiceNumber,
      pdfBuffer,
    );

    const invoice = await this.invoiceRepository.create(
      new Invoice(
        command.userId,
        command.paymentType,
        command.paymentId,
        stored.path,
        command.data.invoiceNumber,
      ),
    );

    if (!invoice.id) {
      this.logger.error(
        `Impossible d'enregistrer la facture pour ${command.paymentType} #${command.paymentId}.`,
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
