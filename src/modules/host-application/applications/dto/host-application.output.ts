import type { HostApplicationStatus } from '@src/modules/host-application/domain/constants/host-application-status.constant';
import type { HostApplication } from '@src/modules/host-application/domain/entities/host-application.entity';
import type { User } from '@src/modules/user/contracts';

export type HostApplicationApplicantOutput = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
};

export class HostApplicationOutput {
  constructor(
    public readonly id: number,
    public readonly userId: number,
    public readonly city: string,
    public readonly message: string,
    public readonly status: HostApplicationStatus,
    public readonly propertyName: string | null,
    public readonly reviewComment: string | null,
    public readonly reviewedAt: Date | null,
    public readonly createdAt: Date,
    public readonly applicant?: HostApplicationApplicantOutput,
  ) {}

  static fromDomain(
    application: HostApplication,
    applicant?: User | null,
  ): HostApplicationOutput {
    return new HostApplicationOutput(
      application.id!,
      application.userId,
      application.city,
      application.message,
      application.status,
      application.propertyName,
      application.reviewComment,
      application.reviewedAt,
      application.createdAt!,
      applicant?.id
        ? {
            id: applicant.id,
            firstName: applicant.firstName,
            lastName: applicant.lastName,
            email: applicant.email,
            phoneNumber: applicant.phoneNumber,
          }
        : undefined,
    );
  }
}
