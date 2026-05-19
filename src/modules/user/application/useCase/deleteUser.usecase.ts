import { Inject } from "@nestjs/common";
import type { IUserRepository } from "../../domain/repositories/user.repository";
import { USER_REPOSITORY } from "../../infrastructure/repositories/user.repository";

export class DeleteUserUseCase {
    constructor(@Inject(USER_REPOSITORY) private readonly repository: IUserRepository) {}

    async execute(id: number): Promise<boolean> {
        return this.repository.delete(+id!);
    }
}
