import type { AdminManageableAccountStatus } from '../../../../authentication/domain/constants/account-status.constant';

export class UpdateUserStatusCommand {
  constructor(
    public readonly userId: number,
    public readonly status: AdminManageableAccountStatus,
  ) {}
}
