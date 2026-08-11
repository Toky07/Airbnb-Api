import type { PaginatedResult } from '@src/shared/pagination/pagination.types';
import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import type { IEmailRepository } from '@src/modules/mail/domain/repositories/email.repository';
import { EmailOutput } from '@src/modules/mail/applications/dto/email.output';
import type { ListEmailsQuery } from '@src/modules/mail/applications/useCase/queries/ListEmailsQuery';

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
