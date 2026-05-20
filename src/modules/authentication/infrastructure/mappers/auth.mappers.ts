import { Auth } from "../../domain/entities/user.entity";
import { AuthEntity } from "../entity/auth.entity";
import { EmailVO } from "../../../../shared/valueObject/email.vo";

export class AuthMapper {
    static toDomain(auth: AuthEntity): Auth {
        return new Auth(new EmailVO(auth.email), auth.password);
    }

    static toEntity(auth: Auth) {
        return {
            email: auth.email,
            password: auth.password,
        };
    }
}
