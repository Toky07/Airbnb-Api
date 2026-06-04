import { Inject, Injectable } from '@nestjs/common';
import type { PaginatedResult, PaginationParams } from '../../../shared/pagination/pagination.types';
import { RoleOutput } from '../application/dto/role.output';
import { type IRoleRepository, ROLE_REPOSITORY } from '../domain/repositories/role.repository';
import { RoleEntity } from '../domain/entities/role.entity';

@Injectable()
export class ListRolesUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY) private readonly repository: IRoleRepository,
  ) {}

  async execute(params: PaginationParams): Promise<PaginatedResult<RoleOutput>> {
    const result = await this.repository.findPaginated(params);

    return {
      data: result.data.map((role: RoleEntity) => RoleOutput.fromDomain(role)),
      meta: result.meta,
    };
  }
}
