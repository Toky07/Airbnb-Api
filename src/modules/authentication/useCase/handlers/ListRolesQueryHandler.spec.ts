import { UserNameVO } from '../../../user/domain/valueObject/username.vo';
import { RoleOutput } from '../../application/dto/role.output';
import { RoleEntity } from '../../domain/entities/role.entity';
import type { IRoleRepository } from '../../domain/repositories/role.repository';
import { ListRolesQueryHandler } from './ListRolesQueryHandler';
import { ListRolesQuery } from '../queries/ListRolesQuery';
import { buildPaginationMeta } from '../../../../shared/pagination/pagination.types';

const repository = {
  findPaginated: async () => ({
    data: [RoleOutput.fromDomain(new RoleEntity(new UserNameVO('test')))],
    meta: buildPaginationMeta(1, 1, 10),
  }),
} as unknown as IRoleRepository;

describe('ListRolesQueryHandler', () => {
  it('should list roles', async () => {
    const handler = new ListRolesQueryHandler(repository);
    const result = await handler.execute(new ListRolesQuery({ page: 1, limit: 10 }));
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toBeInstanceOf(RoleOutput);
  });
});
