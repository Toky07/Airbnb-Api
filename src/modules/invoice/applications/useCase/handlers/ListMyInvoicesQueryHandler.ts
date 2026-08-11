import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import { ResolveAuthenticatedUserService } from '@src/shared/auth/resolve-authenticated-user.service';
import type { IUserRepository } from '@src/modules/user/contracts';
import { InvoiceOutput } from '@src/modules/invoice/applications/dto/invoice.output';
import type { IInvoiceRepository } from '@src/modules/invoice/domain/repositories/invoice.repository';
import type { ListMyInvoicesQuery } from '@src/modules/invoice/applications/useCase/queries/ListMyInvoicesQuery';

export class ListMyInvoicesQueryHandler implements IQueryHandler<
  ListMyInvoicesQuery,
  InvoiceOutput[]
> {
  private readonly resolveAuthenticatedUser: ResolveAuthenticatedUserService;

  constructor(
    private readonly invoiceRepository: IInvoiceRepository,
    userRepository: IUserRepository,
  ) {
    this.resolveAuthenticatedUser = new ResolveAuthenticatedUserService(
      userRepository,
    );
  }

  async execute(query: ListMyInvoicesQuery): Promise<InvoiceOutput[]> {
    const userId = await this.resolveAuthenticatedUser.resolveUserId(
      query.authId,
    );
    const invoices = await this.invoiceRepository.findByUserId(userId);
    return invoices.map((invoice) => InvoiceOutput.fromDomain(invoice));
  }
}
