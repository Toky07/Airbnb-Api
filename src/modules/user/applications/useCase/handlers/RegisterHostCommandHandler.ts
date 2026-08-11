import { BadRequestException } from '@nestjs/common';
import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import type { IAuthRepository } from '@src/modules/authentication/contracts';
import type { IRoleRepository } from '@src/modules/authentication/contracts';
import type { IUserRepository } from '@src/modules/user/domain/repositories/user.repository';
import { EmailVO } from '@src/shared/valueObject/email.vo';
import { TRAVELER_ROLE_SLUG } from '@src/modules/authentication/contracts';
import { User } from '@src/modules/user/domain/entities/user.entity';
import { UserNameVO } from '@src/modules/user/domain/valueObject/username.vo';
import { PhoneNumberVO } from '@src/shared/valueObject/phone.vo';
import { CommandBus } from '@src/shared/useCase/bus/bus';
import { SendAccountInvitationCommand } from '@src/modules/authentication/contracts';
import { ACCOUNT_STATUS } from '@src/modules/authentication/contracts';
import type { RegisterHostCommand } from '@src/modules/user/applications/useCase/commands/RegisterHostCommand';

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

    const travelerRole =
      await this.roleRepository.findBySlug(TRAVELER_ROLE_SLUG);
    if (travelerRole?.id) {
      await this.authRepository.assignRoles(pendingAuth.id, [travelerRole.id]);
    }

    await CommandBus.execute(
      new SendAccountInvitationCommand({
        userId: createdUser.id,
        sourceModule: 'user-registration',
      }),
    );

    return true;
  }
}
