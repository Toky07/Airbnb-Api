import type { IUserRepository } from "../../domain/repositories/user.repository";
import { User } from "../../domain/entities/user.entity";
import { UserNameVO } from "../../domain/valueObject/username.vo";
import { EmailVO } from "../../../../shared/valueObject/email.vo";
import { CreateUserDto } from "../../domain/dtos/createUser.dto";
import { UserOutput } from "../../domain/dtos/user.output";
import { USER_REPOSITORY } from "../../infrastructure/repositories/user.repository";
import { Inject, Injectable } from '@nestjs/common';
import { PhoneNumberVO } from "../../../../shared/valueObject/phone.vo";
import type { UploadFile } from "../../../media/types/upload-file";
import { SaveUserAvatarUseCase } from "./saveUserAvatar.usecase";
import { validateUserFields } from "../validation/validate-user-fields";
import { ACCOUNT_STATUS } from "../../../account-activation/domain/constants/account-status.constant";
import { SendAccountInvitationUseCase } from "../../../account-activation/application/useCase/send-account-invitation.usecase";

@Injectable()
export class CreateUserUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly repository: IUserRepository,
        private readonly saveUserAvatar: SaveUserAvatarUseCase,
        private readonly sendAccountInvitation: SendAccountInvitationUseCase,
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
            undefined,
            undefined,
            undefined,
            undefined,
            [],
            false,
            ACCOUNT_STATUS.PENDING,
        );

        const created = await this.repository.create(user);
        const avatar = await this.saveUserAvatar.resolve(created.id!, '', {
            file: avatarFile,
            avatarFromDto: createUserDto.avatar,
        });

        let saved = created;
        if (avatar !== created.avatar) {
            created.avatar = avatar;
            saved = await this.repository.update(created);
        }

        await this.sendAccountInvitation.execute({
            userId: saved.id!,
            sourceModule: 'admin-user-create',
        });

        return UserOutput.fromDomain(await this.repository.findById(saved.id!) ?? saved);
    }
}
