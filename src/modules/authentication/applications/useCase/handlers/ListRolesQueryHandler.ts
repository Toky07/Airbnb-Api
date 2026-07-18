import type { PaginatedResult } from '../../../../../shared/pagination/pagination.types';
import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { IRoleRepository } from '../../../domain/repositories/role.repository';
import { RoleEntity } from '../../../domain/entities/role.entity';
import { RoleOutput } from '../../dto/role.output';
import type { ListRolesQuery } from '../queries/ListRolesQuery';

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
