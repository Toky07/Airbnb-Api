import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import { HOST_ROLE_SLUG } from '@src/modules/authentication/contracts';
import type { IUserRepository } from '@src/modules/user/contracts';
import { ResolveAuthenticatedUserService } from '@src/shared/auth/resolve-authenticated-user.service';
import { HOST_APPLICATION_STATUS } from '@src/modules/host-application/domain/constants/host-application-status.constant';
import { HostApplication } from '@src/modules/host-application/domain/entities/host-application.entity';
import type { IHostApplicationRepository } from '@src/modules/host-application/domain/repositories/host-application.repository';
import { HostApplicationOutput } from '@src/modules/host-application/applications/dto/host-application.output';
import type { HostApplicationMailService } from '@src/modules/host-application/applications/services/host-application-mail.service';
import type { SubmitHostApplicationCommand } from '@src/modules/host-application/applications/useCase/commands/SubmitHostApplicationCommand';

export class SubmitHostApplicationCommandHandler implements ICommandHandler<
  SubmitHostApplicationCommand,
  HostApplicationOutput
> {
  constructor(
    private readonly hostApplicationRepository: IHostApplicationRepository,
    private readonly userRepository: IUserRepository,
    private readonly resolveAuthenticatedUser: ResolveAuthenticatedUserService,
    private readonly mailService: HostApplicationMailService,
  ) {}

  async execute(
    command: SubmitHostApplicationCommand,
  ): Promise<HostApplicationOutput> {
    const user = await this.resolveAuthenticatedUser.resolveUser(
      command.authId,
    );
    const alreadyHost = user.roles.some((role) => role.slug === HOST_ROLE_SLUG);
    if (alreadyHost) {
      throw new ForbiddenException('Vous êtes déjà hôte.');
    }

    const pending = await this.hostApplicationRepository.findPendingByUserId(
      user.id!,
    );
    if (pending) {
      throw new ConflictException('Une demande est déjà en cours d’examen.');
    }

    const city = command.dto.city.trim();
    const message = command.dto.message.trim();
    const propertyName = command.dto.propertyName?.trim() || null;

    if (!city) {
      throw new BadRequestException('La ville est obligatoire.');
    }

    const created = await this.hostApplicationRepository.create(
      new HostApplication(
        user.id!,
        city,
        message,
        HOST_APPLICATION_STATUS.PENDING,
        propertyName,
      ),
    );

    await this.mailService.notifySubmitted(created, user);

    return HostApplicationOutput.fromDomain(created, user);
  }
}
