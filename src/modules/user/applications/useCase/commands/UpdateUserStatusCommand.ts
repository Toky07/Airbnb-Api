import type { AdminManageableAccountStatus } from '@src/modules/authentication/contracts';

export class UpdateUserStatusCommand {
  constructor(
    public readonly userId: number,
    public readonly status: AdminManageableAccountStatus,
  ) {}
}
