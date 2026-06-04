import { UserNameVO } from '../../user/domain/valueObject/username.vo';
import { RoleOutput } from '../application/dto/role.output';
import { RoleEntity } from '../domain/entities/role.entity';
import type { IRoleRepository } from '../domain/repositories/role.repository';
import { ListRolesUseCase } from './list-role.usecase';
import { buildPaginationMeta } from '../../../shared/pagination/pagination.types';

const repository = {
  findPaginated: async () => ({
    data: [RoleOutput.fromDomain(new RoleEntity(new UserNameVO('test')))],
    meta: buildPaginationMeta(1, 1, 10),
  }),
} as unknown as IRoleRepository;

describe('ListRoleUseCase', () => {
  it('should list roles', async () => {
    const listRolesUseCase = new ListRolesUseCase(repository);
    const result = await listRolesUseCase.execute({ page: 1, limit: 10 });
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toBeInstanceOf(RoleOutput);
  });
});
