import { UserNameVO } from "../valueObject/username.vo";
import { EmailVO } from "src/shared/valueObject/email.vo";

export class User {
    constructor(
        public readonly _firstName: UserNameVO,
        public readonly _lastName: UserNameVO,
        public readonly _email: EmailVO,
        public readonly password: string,
        public readonly _id?: string,
        public readonly _createdAt?: Date,
        public readonly _updatedAt?: Date,
    ) {}

    public get id(): string|undefined {
        return this._id;
    }

    public get name(): string {
        return `${this._firstName.value} ${this._lastName.value}`;
    }

    public get email(): string {
        return this._email.value;
    }

    public get firstName(): string {
        return this._firstName.value;
    }

    public get lastName(): string {
        return this._lastName.value;
    }
}