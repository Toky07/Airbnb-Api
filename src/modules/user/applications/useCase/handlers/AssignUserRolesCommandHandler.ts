import { NotFoundException } from '@nestjs/common';
import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import { CommandBus } from '@src/shared/useCase/bus/bus';
import {
  SendAccountInvitationCommand,
  assertCanAssignRoleIds,
  type IAuthRepository,
  type IRoleRepository,
} from '@src/modules/authentication/contracts';
import type { IUserRepository } from '@src/modules/user/domain/repositories/user.repository';
import { UserOutput } from '@src/modules/user/domain/dtos/user.output';
import type { AssignUserRolesCommand } from '@src/modules/user/applications/useCase/commands/AssignUserRolesCommand';

export class AssignUserRolesCommandHandler implements ICommandHandler<
  AssignUserRolesCommand,
  UserOutput
> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly authRepository: IAuthRepository,
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(command: AssignUserRolesCommand): Promise<UserOutput> {
    const user = await this.userRepository.findById(command.userId);

    if (!user?.id) {
      throw new NotFoundException('User not found');
    }

    let auth =
      user.authId != null
        ? await this.authRepository.findById(user.authId)
        : await this.authRepository.findByEmail(user.email);

    if (!auth?.id) {
      auth = await this.authRepository.createPending(user.email);
      if (!auth?.id) {
        throw new NotFoundException(
          'Impossible de créer le compte de connexion.',
        );
      }
      await this.userRepository.linkAuthAccount(command.userId, auth.id);
      await CommandBus.execute(
        new SendAccountInvitationCommand({
          userId: command.userId,
          sourceModule: 'admin-role-assign',
        }),
      );
    } else if (user.authId == null) {
      await this.userRepository.linkAuthAccount(command.userId, auth.id);
    }

    await assertCanAssignRoleIds(
      this.roleRepository,
      command.roleIds,
      command.actorIsSuperAdmin,
    );

    await this.authRepository.assignRoles(auth.id, command.roleIds);

    const updated = await this.userRepository.findById(command.userId);
    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return UserOutput.fromDomain(updated);
  }
}
