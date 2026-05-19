import type { IUserRepository } from "../../domain/repositories/user.repository";
import { User } from "../../domain/entities/user.entity";
import { UpdateUserDto } from "../../domain/dtos/createUser.dto";
import { Inject } from "@nestjs/common";
import { USER_REPOSITORY } from "../../infrastructure/repositories/user.repository";
import { UserOutput } from "../../domain/dtos/user.output";

export class UpdateUserUseCase {
    constructor(@Inject(USER_REPOSITORY) private readonly repository: IUserRepository) {}

    async execute(updateUserDto: UpdateUserDto): Promise<UserOutput> {
        const user = await this.repository.findById(updateUserDto.id);

        if (!user) {
            throw new Error('User not found');
        }

        user.firstName = updateUserDto.firstName;
        user.lastName = updateUserDto.lastName;
        user.email = updateUserDto.email;

        return UserOutput.fromDomain(await this.repository.update(user));
    }
}