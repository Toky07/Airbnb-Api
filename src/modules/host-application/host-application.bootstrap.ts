import type { EnsureAuthHasRoleService } from '@src/modules/authentication/applications/services/ensure-auth-has-role.service';
import type { MailService } from '@src/modules/mail/contracts';
import type { IUserRepository } from '@src/modules/user/contracts';
import { ResolveAuthenticatedUserService } from '@src/shared/auth/resolve-authenticated-user.service';
import type { IHostApplicationRepository } from './domain/repositories/host-application.repository';
import { HostApplicationMailService } from './applications/services/host-application-mail.service';
import { SubmitHostApplicationCommandHandler } from './applications/useCase/handlers/SubmitHostApplicationCommandHandler';
import { ReviewHostApplicationCommandHandler } from './applications/useCase/handlers/ReviewHostApplicationCommandHandler';
import { GetMyHostApplicationQueryHandler } from './applications/useCase/handlers/GetMyHostApplicationQueryHandler';
import { ListHostApplicationsQueryHandler } from './applications/useCase/handlers/ListHostApplicationsQueryHandler';
import { ListHostsQueryHandler } from './applications/useCase/handlers/ListHostsQueryHandler';

export class HostApplicationBootstrap {
  static create(deps: {
    hostApplicationRepository: IHostApplicationRepository;
    userRepository: IUserRepository;
    ensureAuthHasRole: EnsureAuthHasRoleService;
    mailService: MailService;
  }) {
    const resolveAuthenticatedUser = new ResolveAuthenticatedUserService(
      deps.userRepository,
    );
    const hostApplicationMailService = new HostApplicationMailService(
      deps.mailService,
    );

    return {
      submitHostApplicationCommandHandler:
        new SubmitHostApplicationCommandHandler(
          deps.hostApplicationRepository,
          deps.userRepository,
          resolveAuthenticatedUser,
          hostApplicationMailService,
        ),
      reviewHostApplicationCommandHandler:
        new ReviewHostApplicationCommandHandler(
          deps.hostApplicationRepository,
          deps.userRepository,
          deps.ensureAuthHasRole,
          hostApplicationMailService,
        ),
      getMyHostApplicationQueryHandler: new GetMyHostApplicationQueryHandler(
        deps.hostApplicationRepository,
        resolveAuthenticatedUser,
      ),
      listHostApplicationsQueryHandler: new ListHostApplicationsQueryHandler(
        deps.hostApplicationRepository,
        deps.userRepository,
      ),
      listHostsQueryHandler: new ListHostsQueryHandler(deps.userRepository),
    };
  }
}
