import { Inject } from "@nestjs/common";
import type { IUserRepository } from "../../domain/repositories/user.repository";
import { USER_REPOSITORY } from "../../infrastructure/repositories/user.repository";
import { SaveUserAvatarUseCase } from "./saveUserAvatar.usecase";

export class DeleteUserUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly repository: IUserRepository,
        private readonly saveUserAvatar: SaveUserAvatarUseCase,
    ) {}

    async execute(id: number): Promise<boolean> {
        const user = await this.repository.findById(id);
        if (user) {
            await this.saveUserAvatar.deleteStored(user.avatar);
        }
        return this.repository.delete(+id!);
    }
}
