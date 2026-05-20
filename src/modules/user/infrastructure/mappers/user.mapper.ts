import { User } from "../../domain/entities/user.entity";
import { UserNameVO } from "../../domain/valueObject/username.vo";
import { EmailVO } from "../../../../shared/valueObject/email.vo";
import { UserEntity } from "../entities/user.entity";

export class UserMapper {
    static toDomain(user: any): User {
        return new User(
            new UserNameVO(user.firstName),
            new UserNameVO(user.lastName),
            new EmailVO(user.email),
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
            createdAt: user._createdAt!,
            updatedAt: user._updatedAt!,
        };
    }
}