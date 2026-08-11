import type { PaginatedResult } from '@src/shared/pagination/pagination.types';
import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import type { IRoleRepository } from '@src/modules/authentication/domain/repositories/role.repository';
import { RoleEntity } from '@src/modules/authentication/domain/entities/role.entity';
import { RoleOutput } from '@src/modules/authentication/applications/dto/role.output';
import type { ListRolesQuery } from '@src/modules/authentication/applications/useCase/queries/ListRolesQuery';

export class ListRolesQueryHandler implements IQueryHandler<
  ListRolesQuery,
  PaginatedResult<RoleOutput>
> {
  constructor(private readonly repository: IRoleRepository) {}

  async execute(query: ListRolesQuery): Promise<PaginatedResult<RoleOutput>> {
    const result = await this.repository.findPaginated(query.params);

    return {
      data: result.data.map((role: RoleEntity) => RoleOutput.fromDomain(role)),
      meta: result.meta,
    };
  }
}
