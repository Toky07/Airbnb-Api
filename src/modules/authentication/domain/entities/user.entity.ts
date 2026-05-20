import { EmailVO } from "src/shared/valueObject/email.vo";

export class User {
    constructor(
        public _email: EmailVO,
        public readonly password: string,
    ) {}
}
