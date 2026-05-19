import { User } from "../entities/user.entity";

export class UserOutput {
    constructor(
        public readonly id: number,
        public readonly firstName: string,
        public readonly lastName: string,
        public readonly email: string,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) {}

    public static fromDomain(user: User): UserOutput {
        return new UserOutput(
            user.id!,
            user.firstName,
            user.lastName,
            user.email,
            user._createdAt!,
            user._updatedAt!,
        );
    }
}