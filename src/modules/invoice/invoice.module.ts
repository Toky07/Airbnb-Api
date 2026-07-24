import { Inject, Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { USER_REPOSITORY } from '../user/infrastructure/repositories/user.repository';
import type { IUserRepository } from '../user/domain/repositories/user.repository';
import { GenerateInvoicePdfService } from './applications/services/generate-invoice-pdf.service';
import { InvoiceNumberService } from './applications/services/invoice-number.service';
import { INVOICE_REPOSITORY } from './domain/repositories/invoice.repository';
import type { IInvoiceRepository } from './domain/repositories/invoice.repository';
import { InvoiceOrmEntity } from './infrastructure/entities/invoice.orm-entity';
import { InvoiceSequenceOrmEntity } from './infrastructure/entities/invoice-sequence.orm-entity';
import { InvoiceRepository } from './infrastructure/repositories/invoice.repository';
import { InvoiceSequenceRepository } from './infrastructure/repositories/invoice-sequence.repository';
import { InvoiceStorageService } from './infrastructure/storage/invoice-storage.service';
import { InvoiceController } from './interfaces/http/invoice.controller';
import { EventBus } from '../../shared/domain/event.bus';
import { CommandBus } from '../../shared/useCase/bus/bus';
import { QueryBus } from '../../shared/useCase/bus/query-bus';
import { InvoiceGenerateRequestedEvent } from './domain/events/invoice-generate-requested.event';
import { CreateInvoiceCommand } from './applications/useCase/commands/CreateInvoiceCommand';
import { ListMyInvoicesQuery } from './applications/useCase/queries/ListMyInvoicesQuery';
import { ListInvoicesQuery } from './applications/useCase/queries/ListInvoicesQuery';
import { DownloadInvoiceQuery } from './applications/useCase/queries/DownloadInvoiceQuery';
import { InvoiceBootstrap } from './invoice.bootstrap';

@Module({
  imports: [
    TypeOrmModule.forFeature([InvoiceOrmEntity, InvoiceSequenceOrmEntity]),
    UserModule,
  ],
  controllers: [InvoiceController],
  providers: [
    InvoiceRepository,
    InvoiceSequenceRepository,
    {
      provide: INVOICE_REPOSITORY,
      useClass: InvoiceRepository,
    },
    InvoiceStorageService,
    GenerateInvoicePdfService,
    InvoiceNumberService,
  ],
  exports: [INVOICE_REPOSITORY, InvoiceNumberService],
})
export class InvoiceModule implements OnModuleInit {
  constructor(
    @Inject(INVOICE_REPOSITORY)
    private readonly invoiceRepository: IInvoiceRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly generateInvoicePdf: GenerateInvoicePdfService,
    private readonly invoiceStorage: InvoiceStorageService,
    private readonly invoiceNumberService: InvoiceNumberService,
  ) {}

  onModuleInit() {
    const bootstrap = InvoiceBootstrap.create({
      invoiceRepository: this.invoiceRepository,
      generateInvoicePdf: this.generateInvoicePdf,
      invoiceStorage: this.invoiceStorage,
      invoiceNumberService: this.invoiceNumberService,
      userRepository: this.userRepository,
    });

    CommandBus.register(
      CreateInvoiceCommand,
      bootstrap.createInvoiceCommandHandler,
    );
    QueryBus.register(
      ListMyInvoicesQuery,
      bootstrap.listMyInvoicesQueryHandler,
    );
    QueryBus.register(ListInvoicesQuery, bootstrap.listInvoicesQueryHandler);
    QueryBus.register(
      DownloadInvoiceQuery,
      bootstrap.downloadInvoiceQueryHandler,
    );

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
