import { UserNameVO } from '@src/modules/user/contracts';
import { RoleOutput } from '@src/modules/authentication/applications/dto/role.output';
import { RoleEntity } from '@src/modules/authentication/domain/entities/role.entity';
import type { IRoleRepository } from '@src/modules/authentication/domain/repositories/role.repository';
import { ListRolesQueryHandler } from './ListRolesQueryHandler';
import { ListRolesQuery } from '@src/modules/authentication/applications/useCase/queries/ListRolesQuery';
import { buildPaginationMeta } from '@src/shared/pagination/pagination.types';

const repository = {
  findPaginated: async () => ({
    data: [
      RoleOutput.fromDomain(new RoleEntity(new UserNameVO('test'), 'test', 1)),
    ],
    meta: buildPaginationMeta(1, 1, 10),
  }),
} as unknown as IRoleRepository;

describe('ListRolesQueryHandler', () => {
  it('should list roles', async () => {
    const handler = new ListRolesQueryHandler(repository);
    const result = await handler.execute(
      new ListRolesQuery({ page: 1, limit: 10 }),
    );
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toBeInstanceOf(RoleOutput);
  });
});
