import { User } from '../../domain/entities/user.entity';
import { UserNameVO } from '../../domain/valueObject/username.vo';
import { EmailVO } from '../../../../shared/valueObject/email.vo';
import { UserEntity } from '../entities/user.entity';
import { PhoneNumberVO } from '../../../../shared/valueObject/phone.vo';
import type { UserRoleSummary } from '../../domain/dtos/user.output';
import type { AccountStatus } from '../../../authentication/contracts';
import { AccountStatusResolver } from '../../../authentication/contracts';

export class UserMapper {
  static toDomain(user: UserEntity): User {
    const roles: UserRoleSummary[] = (user.auth?.roles ?? []).map((role) => ({
      slug: role.slug,
      name: role.name,
    }));

    const status = AccountStatusResolver.resolve({
      authId: user.authId,
      auth: user.auth,
      status: user.status as AccountStatus,
    });

    return new User(
      new UserNameVO(user.firstName),
      new UserNameVO(user.lastName),
      new EmailVO(user.email),
      new PhoneNumberVO(user.phoneNumber),
      user.avatar,
      user.id,
      user.createdAt,
      user.updatedAt,
      user.authId,
      roles,
      Boolean(user.authId ?? user.auth?.id),
      status,
    );
  }

  static toEntity(user: User): UserEntity {
    return {
      id: user._id!,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      avatar: user.avatar,
      status: user.status,
      authId: user.authId ?? null,
      createdAt: user._createdAt!,
      updatedAt: user._updatedAt!,
    };
  }
}
