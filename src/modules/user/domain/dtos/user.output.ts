import { User } from '../entities/user.entity';
import type { AccountStatus } from '../../../account-activation/domain/constants/account-status.constant';

export type UserRoleSummary = {
  slug: string;
  name: string;
};

export class UserOutput {
  constructor(
    public readonly id: number,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly email: string,
    public readonly phoneNumber: string,
    public readonly avatar: string = '',
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly roles: UserRoleSummary[] = [],
    public readonly authLinked: boolean = false,
    public readonly status: AccountStatus = 'active',
  ) {}

  public static fromDomain(user: User): UserOutput {
    return new UserOutput(
      user.id!,
      user.firstName,
      user.lastName,
      user.email,
      user.phoneNumber,
      user.avatar || '',
      user._createdAt!,
      user._updatedAt!,
      user.roles,
      user.authLinked,
      user.status,
    );
  }
}
