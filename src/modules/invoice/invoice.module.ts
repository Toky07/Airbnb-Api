import { Inject, Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GenerateInvoicePdfService } from './applications/services/generate-invoice-pdf.service';
import { INVOICE_REPOSITORY } from './domain/repositories/invoice.repository';
import type { IInvoiceRepository } from './domain/repositories/invoice.repository';
import { InvoiceOrmEntity } from './infrastructure/entities/invoice.orm-entity';
import { InvoiceRepository } from './infrastructure/repositories/invoice.repository';
import { InvoiceStorageService } from './infrastructure/storage/invoice-storage.service';
import { EventBus } from '../../shared/domain/event.bus';
import { CommandBus } from '../../shared/useCase/bus/bus';
import { InvoiceGenerateRequestedEvent } from './domain/events/invoice-generate-requested.event';
import { CreateInvoiceCommand } from './applications/useCase/commands/CreateInvoiceCommand';
import { InvoiceBootstrap } from './invoice.bootstrap';

@Module({
  imports: [TypeOrmModule.forFeature([InvoiceOrmEntity])],
  providers: [
    InvoiceRepository,
    {
      provide: INVOICE_REPOSITORY,
      useClass: InvoiceRepository,
    },
    InvoiceStorageService,
    GenerateInvoicePdfService,
  ],
})
export class InvoiceModule implements OnModuleInit {
  constructor(
    @Inject(INVOICE_REPOSITORY)
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly generateInvoicePdf: GenerateInvoicePdfService,
    private readonly invoiceStorage: InvoiceStorageService,
  ) {}

  onModuleInit() {
    const bootstrap = InvoiceBootstrap.create({
      invoiceRepository: this.invoiceRepository,
      generateInvoicePdf: this.generateInvoicePdf,
      invoiceStorage: this.invoiceStorage,
    });

    CommandBus.register(CreateInvoiceCommand, bootstrap.createInvoiceCommandHandler);

    EventBus.getInstance().subscribe(
      'invoice.generate.requested',
      async (event: InvoiceGenerateRequestedEvent) => {
        await CommandBus.execute(
          new CreateInvoiceCommand(
            event.userId,
            event.paymentType,
            event.paymentId,
            event.data,
          ),
        );
      },
    );
  }
}
