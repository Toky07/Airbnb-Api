import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import type { IAuthRepository } from '@src/modules/authentication/domain/repositories/auth.repository';
import type { AssignRoleCommand } from '@src/modules/authentication/applications/useCase/commands/AssignRoleCommand';

export class AssignRoleCommandHandler implements ICommandHandler<
  AssignRoleCommand,
  boolean
> {
  constructor(private readonly repository: IAuthRepository) {}

  async execute(command: AssignRoleCommand): Promise<boolean> {
    return this.repository.assignRoles(command.userId, command.roleIds);
  }
}
