import type { IUserRepository } from "../../domain/repositories/user.repository";
import { User } from "../../domain/entities/user.entity";
import { UserNameVO } from "../../domain/valueObject/username.vo";
import { EmailVO } from "../../../../shared/valueObject/email.vo";
import { CreateUserDto } from "../../domain/dtos/createUser.dto";
import { UserOutput } from "../../domain/dtos/user.output";
import { USER_REPOSITORY } from "../../infrastructure/repositories/user.repository";
import { Inject } from "@nestjs/common/decorators/core/inject.decorator";
import { PhoneNumberVO } from "../../../../shared/valueObject/phone.vo";

export class CreateUserUseCase {
    constructor(@Inject(USER_REPOSITORY) private readonly repository: IUserRepository) {}

    async execute(createUserDto: CreateUserDto): Promise<UserOutput> {
        const user = new User(
            new UserNameVO(createUserDto.firstName),
            new UserNameVO(createUserDto.lastName),
            new EmailVO(createUserDto.email),
            new PhoneNumberVO(createUserDto.phoneNumber),
            createUserDto.avatar || '',
        );
        
        return UserOutput.fromDomain(await this.repository.create(user));
    }
}
