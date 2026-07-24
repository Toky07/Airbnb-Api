import { ForbiddenException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RoleEntity } from '../../../domain/entities/role.entity';
import { TRAVELER_ROLE_SLUG } from '../../../domain/constants/system-roles.constant';
import type { IRoleRepository } from '../../../domain/repositories/role.repository';
import { CreateRoleCommandHandler } from './CreateRoleCommandHandler';
import { CreateRoleCommand } from '../commands/CreateRoleCommand';
import { UserNameVO } from '../../../../user/domain/valueObject/username.vo';

describe('CreateRoleCommandHandler', () => {
  const repository = {
    findBySlug: vi.fn(),
    create: vi.fn(async (role: RoleEntity) => role),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    repository.findBySlug.mockResolvedValue(null);
  });

  it('should create a role', async () => {
    const handler = new CreateRoleCommandHandler(
      repository as unknown as IRoleRepository,
    );
    const role = await handler.execute(new CreateRoleCommand({ name: 'test' }));
    expect(role.name).toBe('test');
    expect(role.slug).toBe('test');
    expect(role.isSystem).toBe(false);
  });

  it('should forbid creating a role with a reserved system slug', async () => {
    const handler = new CreateRoleCommandHandler(
      repository as unknown as IRoleRepository,
    );

    await expect(
      handler.execute(
        new CreateRoleCommand({ name: 'Voyageur', slug: TRAVELER_ROLE_SLUG }),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('should mark system-looking names via slugify as reserved when colliding', async () => {
    const handler = new CreateRoleCommandHandler(
      repository as unknown as IRoleRepository,
    );

    await expect(
      handler.execute(new CreateRoleCommand({ name: 'host' })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('returns isSystem false for custom roles', async () => {
    repository.create.mockResolvedValueOnce(
      new RoleEntity(new UserNameVO('Editor'), 'editor', 5),
    );
    const handler = new CreateRoleCommandHandler(
      repository as unknown as IRoleRepository,
    );
    const role = await handler.execute(
      new CreateRoleCommand({ name: 'Editor', slug: 'editor' }),
    );
    expect(role.isSystem).toBe(false);
  });
});
