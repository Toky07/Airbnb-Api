import { IUserRepository } from "../../domain/repositories/user.repository";

export class DeleteUserUseCase {
    constructor(private readonly repository: IUserRepository) {}

    async execute(id: string): Promise<boolean> {
        return this.repository.delete(id);
    }
}
