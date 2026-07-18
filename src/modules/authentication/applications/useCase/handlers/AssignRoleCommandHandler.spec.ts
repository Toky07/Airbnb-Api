import { AssignRoleCommandHandler } from './AssignRoleCommandHandler';
import { AssignRoleCommand } from '../commands/AssignRoleCommand';
import { IAuthRepository } from '../../../domain/repositories/auth.repository';

const repository = {
  assignRoles: async (userId: number, roleId: number[]): Promise<boolean> => {
    return true;
  },
} as IAuthRepository;

describe('AssignRoleCommandHandler', () => {
  it('should assign a role to a user', async () => {
    const handler = new AssignRoleCommandHandler(repository);
    const result = await handler.execute(new AssignRoleCommand(1, [1]));
    expect(result).toBe(true);
  });
});
