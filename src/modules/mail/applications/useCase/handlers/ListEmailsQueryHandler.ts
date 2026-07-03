import type { PaginatedResult } from '../../../../../shared/pagination/pagination.types';
import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { IEmailRepository } from '../../../domain/repositories/email.repository';
import { EmailOutput } from '../../dto/email.output';
import type { ListEmailsQuery } from '../queries/ListEmailsQuery';

export class ListEmailsQueryHandler implements IQueryHandler<
  ListEmailsQuery,
  PaginatedResult<EmailOutput>
> {
  constructor(private readonly repository: IEmailRepository) {}

  async execute(query: ListEmailsQuery): Promise<PaginatedResult<EmailOutput>> {
    const result = await this.repository.findPaginated(query.params);
    return {
      data: result.data.map((email) => EmailOutput.fromDomain(email)),
      meta: result.meta,
    };
  }
}
