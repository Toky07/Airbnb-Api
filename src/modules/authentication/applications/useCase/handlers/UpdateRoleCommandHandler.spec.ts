import { NotFoundException } from '@nestjs/common';
import { UserNameVO } from '../../../../user/domain/valueObject/username.vo';
import { RoleEntity } from '../../../domain/entities/role.entity';
import type { IRoleRepository } from '../../../domain/repositories/role.repository';
import { UpdateRoleCommandHandler } from './UpdateRoleCommandHandler';
import { UpdateRoleCommand } from '../commands/UpdateRoleCommand';

const repository = {
  update: async (role: RoleEntity): Promise<RoleEntity> => role,
  findById: async (): Promise<RoleEntity> =>
    new RoleEntity(new UserNameVO('test'), 'test', 1),
} as unknown as IRoleRepository;

describe('UpdateRoleCommandHandler', () => {
  it('should update a role', async () => {
    const handler = new UpdateRoleCommandHandler(repository);
    const role = await handler.execute(
      new UpdateRoleCommand({ id: 1, name: 'updated' }),
    );
    expect(role.name).toBe('updated');
  });

  it('should throw if the role is not found', async () => {
    const handler = new UpdateRoleCommandHandler(repository);
    vi.spyOn(repository, 'findById').mockResolvedValue(null);
    await expect(
      handler.execute(new UpdateRoleCommand({ id: 2, name: 'test' })),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
