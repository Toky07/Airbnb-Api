import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import type { TokenGenerator } from '../../../domain/generator/token.generator';
import { HOST_ROLE_SLUG } from '../../../domain/constants/permissions.constant';
import type { EnsureAuthHasRoleService } from '../../services/ensure-auth-has-role.service';
import type { BecomeHostCommand } from '../commands/BecomeHostCommand';

export class BecomeHostCommandHandler implements ICommandHandler<
  BecomeHostCommand,
  string
> {
  constructor(
    private readonly ensureAuthHasRole: EnsureAuthHasRoleService,
    private readonly tokenGenerator: TokenGenerator,
  ) {}

  async execute(command: BecomeHostCommand): Promise<string> {
    if (!command.authId) {
      throw new UnauthorizedException();
    }

    const assigned = await this.ensureAuthHasRole.execute(
      command.authId,
      HOST_ROLE_SLUG,
    );

    const token = await this.tokenGenerator.generateForAuthId(command.authId);
    if (!token) {
      throw new BadRequestException(
        assigned
          ? 'Rôle hôte attribué, mais impossible de renouveler la session.'
          : 'Impossible de devenir hôte pour le moment.',
      );
    }

    return token;
  }
}
