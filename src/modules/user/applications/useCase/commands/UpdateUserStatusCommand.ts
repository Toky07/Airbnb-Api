import type { AdminManageableAccountStatus } from '../../../../authentication/contracts';

export class UpdateUserStatusCommand {
  constructor(
    public readonly userId: number,
    public readonly status: AdminManageableAccountStatus,
  ) {}
}
