import { UserNameVO } from '../valueObject/username.vo';
import { EmailVO } from '../../../../shared/valueObject/email.vo';
import { PhoneNumberVO } from '../../../../shared/valueObject/phone.vo';
import type { UserRoleSummary } from '../dtos/user.output';
import type { AccountStatus } from '../../../authentication/contracts';
import { ACCOUNT_STATUS } from '../../../authentication/contracts';

export class User {
  constructor(
    public _firstName: UserNameVO,
    public _lastName: UserNameVO,
    public _email: EmailVO,
    public _phoneNumber: PhoneNumberVO,
    public _avatar?: string,
    public _id?: number,
    public _createdAt?: Date,
    public _updatedAt?: Date,
    public _authId?: number | null,
    public roles: UserRoleSummary[] = [],
    public authLinked = false,
    public status: AccountStatus = ACCOUNT_STATUS.PENDING,
  ) {}

  public get id(): number | undefined {
    return this._id;
  }

  public get authId(): number | null | undefined {
    return this._authId;
  }

  public get name(): string {
    return `${this._firstName.value} ${this._lastName.value}`;
  }

  public get email(): string {
    return this._email.value;
  }

  public get firstName(): string {
    return this._firstName.value;
  }

  public get lastName(): string {
    return this._lastName.value;
  }

  public get phoneNumber(): string {
    return this._phoneNumber.value;
  }

  public get avatar(): string {
    return this._avatar || '';
  }

  public set id(id: number) {
    this._id = id;
  }

  public set firstName(firstName: string) {
    this._firstName = new UserNameVO(firstName);
  }

  public set lastName(lastName: string) {
    this._lastName = new UserNameVO(lastName);
  }

  public set email(email: string) {
    this._email = new EmailVO(email);
  }

  public set phoneNumber(phoneNumber: string) {
    this._phoneNumber = new PhoneNumberVO(phoneNumber);
  }

  public set avatar(avatar: string) {
    this._avatar = avatar;
  }
}
