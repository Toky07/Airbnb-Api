import { User } from "../../domain/entities/user.entity";
import { UserNameVO } from "../../domain/valueObject/username.vo";
import { EmailVO } from "../../../../shared/valueObject/email.vo";
import { UserEntity } from "../entities/user.entity";
import { PhoneNumberVO } from "../../../../shared/valueObject/phone.vo";

export class UserMapper {
    static toDomain(user: any): User {
        return new User(
            new UserNameVO(user.firstName),
            new UserNameVO(user.lastName),
            new EmailVO(user.email),
            new PhoneNumberVO(user.phoneNumber),
            user.avatar,
            user.id,
            user.createdAt,
            user.updatedAt,
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
            createdAt: user._createdAt!,
            updatedAt: user._updatedAt!,
        };
    }
}