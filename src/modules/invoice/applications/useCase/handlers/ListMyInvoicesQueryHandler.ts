import { ForbiddenException } from '@nestjs/common';
import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { IUserRepository } from '../../../../user/domain/repositories/user.repository';
import { InvoiceOutput } from '../../dto/invoice.output';
import type { IInvoiceRepository } from '../../../domain/repositories/invoice.repository';
import type { ListMyInvoicesQuery } from '../queries/ListMyInvoicesQuery';

export class ListMyInvoicesQueryHandler implements IQueryHandler<
  ListMyInvoicesQuery,
  InvoiceOutput[]
> {
  constructor(
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: ListMyInvoicesQuery): Promise<InvoiceOutput[]> {
    const user = await this.userRepository.findByAuthId(query.authId);
    if (!user?.id) {
      throw new ForbiddenException('Accès refusé.');
    }

    const invoices = await this.invoiceRepository.findByUserId(user.id);
    return invoices.map((invoice) => InvoiceOutput.fromDomain(invoice));
  }
}
