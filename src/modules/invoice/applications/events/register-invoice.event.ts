import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventBus } from '../../../../shared/domain/event.bus';
import type { InvoiceGenerateRequestedEvent } from '../../domain/events/invoice-generate-requested.event';
import { CreateInvoiceUseCase } from '../useCase/create-invoice.usecase';

@Injectable()
export class InvoiceEvent implements OnModuleInit {
  constructor(private readonly createInvoice: CreateInvoiceUseCase) {}

  async onModuleInit(): Promise<void> {
    EventBus.getInstance().subscribe(
      'invoice.generate.requested',
      async (event: InvoiceGenerateRequestedEvent) => {
        await this.createInvoice.execute(event);
      },
    );
  }
}
