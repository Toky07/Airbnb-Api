import { NotFoundException } from '@nestjs/common';
import { UserNameVO } from '../../../user/domain/valueObject/username.vo';
import { RoleEntity } from '../../domain/entities/role.entity';
import type { IRoleRepository } from '../../domain/repositories/role.repository';
import { DeleteRoleCommandHandler } from './DeleteRoleCommandHandler';
import { DeleteRoleCommand } from '../commands/DeleteRoleCommand';

const repository = {
  delete: async (): Promise<boolean> => true,
  findById: async (): Promise<RoleEntity> =>
    new RoleEntity(new UserNameVO('test'), 'test', 1),
} as unknown as IRoleRepository;

describe('DeleteRoleCommandHandler', () => {
  it('should delete a role', async () => {
    const handler = new DeleteRoleCommandHandler(repository);
    const isDeleted = await handler.execute(new DeleteRoleCommand(1));
    expect(isDeleted).toBe(true);
  });

  it('should throw if the role is not found', async () => {
    const handler = new DeleteRoleCommandHandler(repository);
    vi.spyOn(repository, 'findById').mockResolvedValue(null);
    await expect(handler.execute(new DeleteRoleCommand(2))).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
