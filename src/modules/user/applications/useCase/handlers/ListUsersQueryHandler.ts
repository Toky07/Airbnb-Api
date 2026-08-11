import type { PaginatedResult } from '@src/shared/pagination/pagination.types';
import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import type { IUserRepository } from '@src/modules/user/domain/repositories/user.repository';
import { UserOutput } from '@src/modules/user/domain/dtos/user.output';
import type { ListUsersQuery } from '@src/modules/user/applications/useCase/queries/ListUsersQuery';

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
