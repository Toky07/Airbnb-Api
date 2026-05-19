import { UserNameVO } from "../valueObject/username.vo";
import { EmailVO } from "src/shared/valueObject/email.vo";

export class User {
    constructor(
        public readonly _id: string,
        public readonly _name: UserNameVO,
        public readonly _email: EmailVO,
        public readonly _password: string,
        public readonly _createdAt?: Date,
        public readonly _updatedAt?: Date,
    ) {}

    public get id(): string {
        return this._id;
    }

    public get name(): string {
        return this._name.value;
    }

    public get email(): string {
        return this._email.value;
    }
}