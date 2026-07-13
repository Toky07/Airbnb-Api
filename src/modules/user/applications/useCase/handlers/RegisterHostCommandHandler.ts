import { BadRequestException } from '@nestjs/common';
import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import type { IAuthRepository } from '../../../../authentication/domain/repositories/auth.repository';
import type { IRoleRepository } from '../../../../authentication/domain/repositories/role.repository';
import type { IUserRepository } from '../../../domain/repositories/user.repository';
import { EmailVO } from '../../../../../shared/valueObject/email.vo';
import { HOST_ROLE_SLUG } from '../../../../authentication/domain/constants/permissions.constant';
import { User } from '../../../domain/entities/user.entity';
import { UserNameVO } from '../../../domain/valueObject/username.vo';
import { PhoneNumberVO } from '../../../../../shared/valueObject/phone.vo';
import { CommandBus } from '../../../../../shared/useCase/bus/bus';
import { SendAccountInvitationCommand } from '../../../../authentication/useCase/commands/SendAccountInvitationCommand';
import { ACCOUNT_STATUS } from '../../../../authentication/domain/constants/account-status.constant';
import type { RegisterHostCommand } from '../commands/RegisterHostCommand';

export class RegisterHostCommandHandler implements ICommandHandler<
  RegisterHostCommand,
  boolean
> {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: RegisterHostCommand): Promise<boolean> {
    const email = command.dto.email.trim().toLowerCase();
    const firstName = command.dto.firstName?.trim();
    const lastName = command.dto.lastName?.trim();
    const phoneNumber = command.dto.phoneNumber?.trim();

    if (!email || !firstName || !lastName || !phoneNumber) {
      throw new BadRequestException('Tous les champs sont obligatoires.');
    }

    const existingAuth = await this.authRepository.findByEmail(email);
    if (existingAuth) {
      throw new BadRequestException('Cet email est déjà utilisé.');
    }

    const user = new User(
      new UserNameVO(firstName),
      new UserNameVO(lastName),
      new EmailVO(email),
      new PhoneNumberVO(phoneNumber),
      '',
      undefined,
      undefined,
      undefined,
      undefined,
      [],
      false,
      ACCOUNT_STATUS.PENDING,
    );

    const createdUser = await this.userRepository.create(user);
    if (!createdUser.id) {
      return false;
    }

    const pendingAuth = await this.authRepository.createPending(email);
    if (!pendingAuth?.id) {
      throw new BadRequestException(
        'Impossible de créer le compte de connexion.',
      );
    }

    await this.userRepository.linkAuthAccount(createdUser.id, pendingAuth.id);

    const hostRole = await this.roleRepository.findBySlug(HOST_ROLE_SLUG);
    if (hostRole?.id) {
      await this.authRepository.assignRoles(pendingAuth.id, [hostRole.id]);
    }

    await CommandBus.execute(
      new SendAccountInvitationCommand({
        userId: createdUser.id,
        sourceModule: 'host-registration',
      }),
    );

    return true;
  }
}
