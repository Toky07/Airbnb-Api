import { User } from "../../domain/entities/user.entity";
import { IUserRepository } from "../../domain/repositories/user.repository";

export class FindUserUseCase {
    constructor(private readonly repository: IUserRepository) {}

    async execute(id: number): Promise<User> {
        const user = await this.repository.findById(id);

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    }
}