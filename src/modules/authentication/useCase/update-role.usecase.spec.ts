import { NotFoundException } from '@nestjs/common';
import { UserNameVO } from '../../user/domain/valueObject/username.vo';
import { RoleEntity } from '../domain/entities/role.entity';
import type { IRoleRepository } from '../domain/repositories/role.repository';
import { UpdateRoleUseCase } from './update-role.usecase';

const repository = {
  update: async (role: RoleEntity): Promise<RoleEntity> => role,
  findById: async (): Promise<RoleEntity> =>
    new RoleEntity(new UserNameVO('test'), 'test', 1),
} as unknown as IRoleRepository;

describe('UseCase: update role use case', () => {
  it('should update a role', async () => {
    const updateRoleUseCase = new UpdateRoleUseCase(repository);
    const role = await updateRoleUseCase.execute({ id: 1, name: 'updated' });
    expect(role.name).toBe('updated');
  });

  it('should throw if the role is not found', async () => {
    const updateRoleUseCase = new UpdateRoleUseCase(repository);
    vi.spyOn(repository, 'findById').mockResolvedValue(null);
    await expect(
      updateRoleUseCase.execute({ id: 2, name: 'test' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
