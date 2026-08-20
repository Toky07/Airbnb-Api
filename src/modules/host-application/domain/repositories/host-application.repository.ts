import type {
  PaginatedResult,
  PaginationParams,
} from '@src/shared/pagination/pagination.types';
import type { HostApplicationStatus } from '@src/modules/host-application/domain/constants/host-application-status.constant';
import type { HostApplication } from '@src/modules/host-application/domain/entities/host-application.entity';

export const HOST_APPLICATION_REPOSITORY = 'HostApplicationRepository';

export type HostApplicationListParams = PaginationParams & {
  status?: HostApplicationStatus;
};

export interface IHostApplicationRepository {
  create(application: HostApplication): Promise<HostApplication>;
  update(application: HostApplication): Promise<HostApplication>;
  findById(id: number): Promise<HostApplication | null>;
  findLatestByUserId(userId: number): Promise<HostApplication | null>;
  findPendingByUserId(userId: number): Promise<HostApplication | null>;
  findPaginated(
    params: HostApplicationListParams,
  ): Promise<PaginatedResult<HostApplication>>;
}
