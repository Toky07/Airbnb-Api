import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import type { PaginatedResult } from '@src/shared/pagination/pagination.types';
import { HOST_ROLE_SLUG } from '@src/modules/authentication/contracts';
import { UserOutput, type IUserRepository } from '@src/modules/user/contracts';
import type { ListHostsQuery } from '@src/modules/host-application/applications/useCase/queries/ListHostsQuery';

export class ListHostsQueryHandler implements IQueryHandler<
  ListHostsQuery,
  PaginatedResult<UserOutput>
> {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(query: ListHostsQuery): Promise<PaginatedResult<UserOutput>> {
    const result = await this.userRepository.findPaginatedByRoleSlug(
      HOST_ROLE_SLUG,
      query.params,
    );

    return {
      data: result.data.map((user) => UserOutput.fromDomain(user)),
      meta: result.meta,
    };
  }
}
