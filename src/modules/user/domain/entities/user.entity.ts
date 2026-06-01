import { UserNameVO } from "../valueObject/username.vo";
import { EmailVO } from "../../../../shared/valueObject/email.vo";

export class User {
    constructor(
        public _firstName: UserNameVO,
        public _lastName: UserNameVO,
        public _email: EmailVO,
        public _id?: number,
        public _createdAt?: Date,
        public _updatedAt?: Date,
    ) {}

    public get id(): number|undefined {
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

    public set id(id: number) {
        this._id = id;
    }

    public set firstName(firstName: string) {
        this._firstName = new UserNameVO(firstName);
    }

    public set lastName(lastName: string) {
        this._lastName = new UserNameVO(lastName);
    }

    public set email(email: string) {
        this._email = new EmailVO(email);
    }
}
