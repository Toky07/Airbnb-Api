import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import { ResolveAuthenticatedUserService } from '../../../../../shared/auth/resolve-authenticated-user.service';
import type { IUserRepository } from '../../../../user/domain/repositories/user.repository';
import { InvoiceOutput } from '../../dto/invoice.output';
import type { IInvoiceRepository } from '../../../domain/repositories/invoice.repository';
import type { ListMyInvoicesQuery } from '../queries/ListMyInvoicesQuery';

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
