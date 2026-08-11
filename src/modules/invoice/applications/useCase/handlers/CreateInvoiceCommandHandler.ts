import { Logger } from '@nestjs/common';
import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import { EventBus } from '@src/shared/domain/event.bus';
import { InvoiceCreatedEvent } from '@src/modules/invoice/domain/events/invoice-created.event';
import { Invoice } from '@src/modules/invoice/domain/entities/invoice.entity';
import type { IInvoiceRepository } from '@src/modules/invoice/domain/repositories/invoice.repository';
import type { GenerateInvoicePdfService } from '@src/modules/invoice/applications/services/generate-invoice-pdf.service';
import type { InvoiceStorageService } from '@src/modules/invoice/infrastructure/storage/invoice-storage.service';
import type { CreateInvoiceCommand } from '@src/modules/invoice/applications/useCase/commands/CreateInvoiceCommand';

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
