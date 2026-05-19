import { User } from "../../domain/entities/user.entity";
import { UserNameVO } from "../../domain/valueObject/username.vo";
import { EmailVO } from "../../../../shared/valueObject/email.vo";

export class UserMapper {
    static toDomain(user: any): User {
        return new User(
            new UserNameVO(user.firstName),
            new UserNameVO(user.lastName),
            new EmailVO(user.email),
            user.password,
        );
    }
}