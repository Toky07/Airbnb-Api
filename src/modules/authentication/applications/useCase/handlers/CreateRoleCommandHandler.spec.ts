import { UserNameVO } from '../../../../user/domain/valueObject/username.vo';
import { RoleEntity } from '../../../domain/entities/role.entity';
import type { IRoleRepository } from '../../../domain/repositories/role.repository';
import { CreateRoleCommandHandler } from './CreateRoleCommandHandler';
import { CreateRoleCommand } from '../commands/CreateRoleCommand';

const repository = {
  findBySlug: vi.fn().mockResolvedValue(null),
  create: vi.fn(async (role: RoleEntity) => role),
} as unknown as IRoleRepository;

describe('CreateRoleCommandHandler', () => {
  it('should create a role', async () => {
    const handler = new CreateRoleCommandHandler(repository);
    const role = await handler.execute(new CreateRoleCommand({ name: 'test' }));
    expect(role.name).toBe('test');
    expect(role.slug).toBe('test');
  });
});
