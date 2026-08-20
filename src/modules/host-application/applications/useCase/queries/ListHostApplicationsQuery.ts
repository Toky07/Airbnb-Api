import type { PaginationParams } from '@src/shared/pagination/pagination.types';
import type { HostApplicationStatus } from '@src/modules/host-application/domain/constants/host-application-status.constant';

export class ListHostApplicationsQuery {
  constructor(
    public readonly params: PaginationParams,
    public readonly status?: HostApplicationStatus,
  ) {}
}
