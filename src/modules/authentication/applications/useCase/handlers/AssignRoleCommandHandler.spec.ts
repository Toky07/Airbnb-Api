import { AssignRoleCommandHandler } from './AssignRoleCommandHandler';
import { AssignRoleCommand } from '@src/modules/authentication/applications/useCase/commands/AssignRoleCommand';
import { IAuthRepository } from '@src/modules/authentication/domain/repositories/auth.repository';

const repository = {
  assignRoles: async (): Promise<boolean> => true,
} as IAuthRepository;

const roleRepository = {
  findById: async () => ({ slug: 'host' }),
} as never;

describe('AssignRoleCommandHandler', () => {
  it('should assign a role to a user', async () => {
    const handler = new AssignRoleCommandHandler(repository, roleRepository);
    const result = await handler.execute(new AssignRoleCommand(1, [1]));
    expect(result).toBe(true);
  });

  it('refuses to assign superadmin when the actor is not superadmin', async () => {
    const superadminRoleRepository = {
      findById: async () => ({ slug: 'superadmin' }),
    } as never;
    const handler = new AssignRoleCommandHandler(
      repository,
      superadminRoleRepository,
    );

    await expect(
      handler.execute(new AssignRoleCommand(1, [1], false)),
    ).rejects.toThrow('Seul un super administrateur peut attribuer ce rôle.');
  });
});
