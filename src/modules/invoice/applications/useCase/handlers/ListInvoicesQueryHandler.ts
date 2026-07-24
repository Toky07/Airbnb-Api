import type { PaginatedResult } from '../../../../../shared/pagination/pagination.types';
import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { IInvoiceRepository } from '../../../domain/repositories/invoice.repository';
import { InvoiceAdminListOutput } from '../../dto/invoice-admin-list.output';
import type { ListInvoicesQuery } from '../queries/ListInvoicesQuery';

export class ListInvoicesQueryHandler implements IQueryHandler<
  ListInvoicesQuery,
  PaginatedResult<InvoiceAdminListOutput>
> {
  constructor(private readonly invoiceRepository: IInvoiceRepository) {}

  async execute(
    query: ListInvoicesQuery,
  ): Promise<PaginatedResult<InvoiceAdminListOutput>> {
    const result = await this.invoiceRepository.findPaginated(query.params);
    return {
      data: result.data.map((record) => InvoiceAdminListOutput.fromRecord(record)),
      meta: result.meta,
    };
  }
}
