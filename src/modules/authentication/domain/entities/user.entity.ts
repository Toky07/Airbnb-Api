import { EmailVO } from "../../../../shared/valueObject/email.vo";
import { RoleEntity } from "./role.entity";

export class Auth {
    constructor(
        public _email: EmailVO,
        public readonly password: string,
        public _roles: RoleEntity[] = [],
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
}
