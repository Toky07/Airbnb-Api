import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import type { PaginatedResult } from '@src/shared/pagination/pagination.types';
import type { IUserRepository } from '@src/modules/user/contracts';
import type { IHostApplicationRepository } from '@src/modules/host-application/domain/repositories/host-application.repository';
import { HostApplicationOutput } from '@src/modules/host-application/applications/dto/host-application.output';
import type { ListHostApplicationsQuery } from '@src/modules/host-application/applications/useCase/queries/ListHostApplicationsQuery';

export class ListHostApplicationsQueryHandler implements IQueryHandler<
  ListHostApplicationsQuery,
  PaginatedResult<HostApplicationOutput>
> {
  constructor(
    private readonly hostApplicationRepository: IHostApplicationRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    query: ListHostApplicationsQuery,
  ): Promise<PaginatedResult<HostApplicationOutput>> {
    const result = await this.hostApplicationRepository.findPaginated({
      ...query.params,
      status: query.status,
    });

    const data = await Promise.all(
      result.data.map(async (application) => {
        const applicant = await this.userRepository.findById(
          application.userId,
        );
        return HostApplicationOutput.fromDomain(application, applicant);
      }),
    );

    return {
      data,
      meta: result.meta,
    };
  }
}
