import { User } from '@src/modules/user/domain/entities/user.entity';
import { UserNameVO } from '@src/modules/user/domain/valueObject/username.vo';
import { EmailVO } from '@src/shared/valueObject/email.vo';
import { UserEntity } from '@src/modules/user/infrastructure/entities/user.entity';
import { PhoneNumberVO } from '@src/shared/valueObject/phone.vo';
import type { UserRoleSummary } from '@src/modules/user/domain/dtos/user.output';
import type { AccountStatus } from '@src/modules/authentication/contracts';
import { AccountStatusResolver } from '@src/modules/authentication/contracts';

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
