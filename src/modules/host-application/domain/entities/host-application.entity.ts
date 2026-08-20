import type { HostApplicationStatus } from '@src/modules/host-application/domain/constants/host-application-status.constant';

export class HostApplication {
  constructor(
    public readonly userId: number,
    public readonly city: string,
    public readonly message: string,
    public readonly status: HostApplicationStatus,
    public readonly propertyName: string | null = null,
    public readonly reviewComment: string | null = null,
    public readonly reviewedByAuthId: number | null = null,
    public readonly reviewedAt: Date | null = null,
    public readonly id?: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
