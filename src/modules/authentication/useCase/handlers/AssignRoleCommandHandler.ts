import type { ICommandHandler } from '../../../../shared/useCase/bus/command-handler.interface';
import type { IAuthRepository } from '../../domain/repositories/auth.repository';
import type { AssignRoleCommand } from '../commands/AssignRoleCommand';

export class AssignRoleCommandHandler implements ICommandHandler<
  AssignRoleCommand,
  boolean
> {
  constructor(private readonly repository: IAuthRepository) {}

  async execute(command: AssignRoleCommand): Promise<boolean> {
    return this.repository.assignRoles(command.userId, command.roleIds);
  }
}
