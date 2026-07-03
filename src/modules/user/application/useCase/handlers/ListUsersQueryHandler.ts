import type { PaginatedResult } from '../../../../../shared/pagination/pagination.types';
import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { IUserRepository } from '../../../domain/repositories/user.repository';
import { UserOutput } from '../../../domain/dtos/user.output';
import type { ListUsersQuery } from '../queries/ListUsersQuery';

export class ListUsersQueryHandler implements IQueryHandler<
  ListUsersQuery,
  PaginatedResult<UserOutput>
> {
  constructor(private readonly repository: IUserRepository) {}

  async execute(query: ListUsersQuery): Promise<PaginatedResult<UserOutput>> {
    const result = await this.repository.findPaginated(query.params);

    return {
      data: result.data.map((user) => UserOutput.fromDomain(user)),
      meta: result.meta,
    };
  }
}
