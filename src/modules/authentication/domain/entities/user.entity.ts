import { EmailVO } from "../../../../shared/valueObject/email.vo";

export class Auth {
    constructor(
        public _email: EmailVO,
        public readonly password: string,
    ) {}

    public get email(): string {
        return this._email.value;
    }

    public set email(email: string) {
        this._email = new EmailVO(email);
    }
}
