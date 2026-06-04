import type { HostAccessOutput } from './host-access.output';
import type { UserProfileOutput } from './user-profile.output';

export class MeOutput {
  constructor(
    public readonly id: number,
    public readonly email: string,
    public readonly roles: string[],
    public readonly permissions: string[],
    public readonly isSuperAdmin: boolean,
    public readonly hostAccess: HostAccessOutput | null,
    public readonly profile: UserProfileOutput | null,
  ) {}
}
