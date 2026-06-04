import type { IUserRepository } from "../../domain/repositories/user.repository";
import { UpdateUserDto } from "../../domain/dtos/createUser.dto";
import { Inject, NotFoundException } from "@nestjs/common";
import { USER_REPOSITORY } from "../../infrastructure/repositories/user.repository";
import { UserOutput } from "../../domain/dtos/user.output";
import type { UploadFile } from "../../../media/types/upload-file";
import { SaveUserAvatarUseCase } from "./saveUserAvatar.usecase";
import { validateUserFields } from "../validation/validate-user-fields";

export class UpdateUserUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly repository: IUserRepository,
        private readonly saveUserAvatar: SaveUserAvatarUseCase,
    ) {}

    async execute(
        updateUserDto: UpdateUserDto,
        avatarFile?: UploadFile,
    ): Promise<UserOutput> {
        const user = await this.repository.findById(updateUserDto.id);

        if (!user) {
            throw new NotFoundException('Utilisateur introuvable.');
        }

        validateUserFields(updateUserDto);

        user.firstName = updateUserDto.firstName;
        user.lastName = updateUserDto.lastName;
        user.email = updateUserDto.email;
        user.phoneNumber = updateUserDto.phoneNumber;
        user.avatar = await this.saveUserAvatar.resolve(user.id!, user.avatar, {
            file: avatarFile,
            avatarFromDto: updateUserDto.avatar,
        });
        
        return UserOutput.fromDomain(await this.repository.update(user));
    }
}