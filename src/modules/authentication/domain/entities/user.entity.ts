import { EmailVO } from '../../../../shared/valueObject/email.vo';
import { RoleEntity } from './role.entity';
import type { AccountStatus } from '../../../account-activation/domain/constants/account-status.constant';
import { ACCOUNT_STATUS } from '../../../account-activation/domain/constants/account-status.constant';

export class Auth {
  constructor(
    public readonly id: number | undefined,
    public _email: EmailVO,
    public readonly password: string | null,
    public _roles: RoleEntity[] = [],
    public status: AccountStatus = ACCOUNT_STATUS.PENDING,
  ) {}

  public get email(): string {
    return this._email.value;
  }

  public set email(email: string) {
    this._email = new EmailVO(email);
  }

  public get roles(): RoleEntity[] {
    return this._roles ?? [];
  }

  public set roles(roles: RoleEntity[]) {
    this._roles = roles;
  }

  public get isActive(): boolean {
    return this.status === ACCOUNT_STATUS.ACTIVE && Boolean(this.password);
  }
}
