import { User } from "../../domain/entities/user.entity";
import { IUserRepository } from "../../domain/repositories/user.repository";

export class ListUsersUseCase {
    constructor(private readonly repository: IUserRepository) {}

    async execute(): Promise<User[]> {
        return this.repository.findAll();
    }
}
