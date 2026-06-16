import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceEvent } from './applications/events/register-invoice.event';
import { GenerateInvoicePdfService } from './applications/services/generate-invoice-pdf.service';
import { CreateInvoiceUseCase } from './applications/useCase/create-invoice.usecase';
import { INVOICE_REPOSITORY } from './domain/repositories/invoice.repository';
import { InvoiceOrmEntity } from './infrastructure/entities/invoice.orm-entity';
import { InvoiceRepository } from './infrastructure/repositories/invoice.repository';
import { InvoiceStorageService } from './infrastructure/storage/invoice-storage.service';

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
    CreateInvoiceUseCase,
    InvoiceEvent,
  ],
  exports: [CreateInvoiceUseCase],
})
export class InvoiceModule {}
