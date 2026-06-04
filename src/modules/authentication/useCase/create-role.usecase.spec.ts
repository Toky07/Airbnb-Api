import { UserNameVO } from '../../user/domain/valueObject/username.vo';
import { RoleEntity } from '../domain/entities/role.entity';
import type { IRoleRepository } from '../domain/repositories/role.repository';
import { CreateRoleUseCase } from './create-role.usecase';

const repository = {
  findBySlug: vi.fn().mockResolvedValue(null),
  create: vi.fn(async (role: RoleEntity) => role),
} as unknown as IRoleRepository;

describe('UseCase: create role use case', () => {
  it('should create a role', async () => {
    const createRoleUseCase = new CreateRoleUseCase(repository);
    const role = await createRoleUseCase.execute({ name: 'test' });
    expect(role.name).toBe('test');
    expect(role.slug).toBe('test');
  });
});
