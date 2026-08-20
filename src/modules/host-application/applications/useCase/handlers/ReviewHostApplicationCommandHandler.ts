import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import { HOST_ROLE_SLUG } from '@src/modules/authentication/contracts';
import type { EnsureAuthHasRoleService } from '@src/modules/authentication/applications/services/ensure-auth-has-role.service';
import type { IUserRepository } from '@src/modules/user/contracts';
import {
  HOST_APPLICATION_REJECT_COMMENT_MIN_LENGTH,
  HOST_APPLICATION_STATUS,
} from '@src/modules/host-application/domain/constants/host-application-status.constant';
import { HostApplication } from '@src/modules/host-application/domain/entities/host-application.entity';
import type { IHostApplicationRepository } from '@src/modules/host-application/domain/repositories/host-application.repository';
import { HostApplicationOutput } from '@src/modules/host-application/applications/dto/host-application.output';
import type { HostApplicationMailService } from '@src/modules/host-application/applications/services/host-application-mail.service';
import type { ReviewHostApplicationCommand } from '@src/modules/host-application/applications/useCase/commands/ReviewHostApplicationCommand';

export class ReviewHostApplicationCommandHandler implements ICommandHandler<
  ReviewHostApplicationCommand,
  HostApplicationOutput
> {
  constructor(
    private readonly hostApplicationRepository: IHostApplicationRepository,
    private readonly userRepository: IUserRepository,
    private readonly ensureAuthHasRole: EnsureAuthHasRoleService,
    private readonly mailService: HostApplicationMailService,
  ) {}

  async execute(
    command: ReviewHostApplicationCommand,
  ): Promise<HostApplicationOutput> {
    const application = await this.hostApplicationRepository.findById(
      command.applicationId,
    );
    if (!application) {
      throw new NotFoundException('Demande introuvable.');
    }

    if (application.status !== HOST_APPLICATION_STATUS.PENDING) {
      throw new BadRequestException(
        'Seules les demandes en attente peuvent être traitées.',
      );
    }

    const comment = command.dto.comment?.trim() || null;
    if (
      command.dto.status === HOST_APPLICATION_STATUS.REJECTED &&
      (!comment || comment.length < HOST_APPLICATION_REJECT_COMMENT_MIN_LENGTH)
    ) {
      throw new BadRequestException(
        'Un motif d’au moins 10 caractères est requis pour un refus.',
      );
    }

    const applicant = await this.userRepository.findById(application.userId);
    if (!applicant?.id) {
      throw new NotFoundException('Candidat introuvable.');
    }

    const updated = await this.hostApplicationRepository.update(
      new HostApplication(
        application.userId,
        application.city,
        application.message,
        command.dto.status,
        application.propertyName,
        comment,
        command.reviewerAuthId,
        new Date(),
        application.id,
        application.createdAt,
      ),
    );

    if (
      command.dto.status === HOST_APPLICATION_STATUS.APPROVED &&
      applicant.authId
    ) {
      await this.ensureAuthHasRole.execute(applicant.authId, HOST_ROLE_SLUG);
    }

    await this.mailService.notifyReviewed(updated, applicant);

    return HostApplicationOutput.fromDomain(updated, applicant);
  }
}
