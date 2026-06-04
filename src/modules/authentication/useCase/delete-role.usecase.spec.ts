import { NotFoundException } from '@nestjs/common';
import { UserNameVO } from '../../user/domain/valueObject/username.vo';
import { RoleEntity } from '../domain/entities/role.entity';
import type { IRoleRepository } from '../domain/repositories/role.repository';
import { DeleteRoleUseCase } from './delete-role.usecase';

const repository = {
  delete: async (): Promise<boolean> => true,
  findById: async (): Promise<RoleEntity> =>
    new RoleEntity(new UserNameVO('test'), 'test', 1),
} as unknown as IRoleRepository;

describe('UseCase: delete role use case', () => {
  it('should delete a role', async () => {
    const deleteRoleUseCase = new DeleteRoleUseCase(repository);
    const isDeleted = await deleteRoleUseCase.execute(1);
    expect(isDeleted).toBe(true);
  });

  it('should throw if the role is not found', async () => {
    const deleteRoleUseCase = new DeleteRoleUseCase(repository);
    vi.spyOn(repository, 'findById').mockResolvedValue(null);
    await expect(deleteRoleUseCase.execute(2)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
