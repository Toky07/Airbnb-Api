import type { IUserRepository } from "../../domain/repositories/user.repository";
import { User } from "../../domain/entities/user.entity";
import { UserNameVO } from "../../domain/valueObject/username.vo";
import { EmailVO } from "../../../../shared/valueObject/email.vo";
import { CreateUserDto } from "../../domain/dtos/createUser.dto";
import { UserOutput } from "../../domain/dtos/user.output";
import { USER_REPOSITORY } from "../../infrastructure/repositories/user.repository";
import { Inject } from "@nestjs/common/decorators/core/inject.decorator";
import { PhoneNumberVO } from "../../../../shared/valueObject/phone.vo";
import type { UploadFile } from "../../../media/types/upload-file";
import { SaveUserAvatarUseCase } from "./saveUserAvatar.usecase";
import { validateUserFields } from "../validation/validate-user-fields";

export class CreateUserUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly repository: IUserRepository,
        private readonly saveUserAvatar: SaveUserAvatarUseCase,
    ) {}

    async execute(
        createUserDto: CreateUserDto,
        avatarFile?: UploadFile,
    ): Promise<UserOutput> {
        validateUserFields(createUserDto);

        const user = new User(
            new UserNameVO(createUserDto.firstName),
            new UserNameVO(createUserDto.lastName),
            new EmailVO(createUserDto.email),
            new PhoneNumberVO(createUserDto.phoneNumber),
            '',
        );

        const created = await this.repository.create(user);
        const avatar = await this.saveUserAvatar.resolve(created.id!, '', {
            file: avatarFile,
            avatarFromDto: createUserDto.avatar,
        });

        if (avatar !== created.avatar) {
            created.avatar = avatar;
            return UserOutput.fromDomain(await this.repository.update(created));
        }

        return UserOutput.fromDomain(created);
    }
}
