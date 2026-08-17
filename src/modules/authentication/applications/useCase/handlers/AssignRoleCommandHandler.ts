import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import type { IAuthRepository } from '@src/modules/authentication/domain/repositories/auth.repository';
import type { IRoleRepository } from '@src/modules/authentication/domain/repositories/role.repository';
import { assertCanAssignRoleIds } from '@src/modules/authentication/domain/utils/assert-can-assign-roles';
import type { AssignRoleCommand } from '@src/modules/authentication/applications/useCase/commands/AssignRoleCommand';

export class AssignRoleCommandHandler implements ICommandHandler<
  AssignRoleCommand,
  boolean
> {
  constructor(
    private readonly repository: IAuthRepository,
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(command: AssignRoleCommand): Promise<boolean> {
    await assertCanAssignRoleIds(
      this.roleRepository,
      command.roleIds,
      command.actorIsSuperAdmin,
    );
    return this.repository.assignRoles(command.userId, command.roleIds);
  }
}
