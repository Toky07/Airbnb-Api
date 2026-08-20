import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import { ResolveAuthenticatedUserService } from '@src/shared/auth/resolve-authenticated-user.service';
import type { IHostApplicationRepository } from '@src/modules/host-application/domain/repositories/host-application.repository';
import { HostApplicationOutput } from '@src/modules/host-application/applications/dto/host-application.output';
import type { GetMyHostApplicationQuery } from '@src/modules/host-application/applications/useCase/queries/GetMyHostApplicationQuery';

export class GetMyHostApplicationQueryHandler implements IQueryHandler<
  GetMyHostApplicationQuery,
  HostApplicationOutput | null
> {
  constructor(
    private readonly hostApplicationRepository: IHostApplicationRepository,
    private readonly resolveAuthenticatedUser: ResolveAuthenticatedUserService,
  ) {}

  async execute(
    query: GetMyHostApplicationQuery,
  ): Promise<HostApplicationOutput | null> {
    const user = await this.resolveAuthenticatedUser.resolveUser(query.authId);
    const application = await this.hostApplicationRepository.findLatestByUserId(
      user.id!,
    );

    if (!application) {
      return null;
    }

    return HostApplicationOutput.fromDomain(application, user);
  }
}
