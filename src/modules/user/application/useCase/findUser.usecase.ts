import { Inject, NotFoundException } from "@nestjs/common";
import { UserOutput } from "../../domain/dtos/user.output";
import { User } from "../../domain/entities/user.entity";
import { type IUserRepository } from "../../domain/repositories/user.repository";
import { UserMapper } from "../../infrastructure/mappers/user.mapper";
import { USER_REPOSITORY } from "../../infrastructure/repositories/user.repository";

export class FindUserUseCase {
    constructor(@Inject(USER_REPOSITORY) private readonly repository: IUserRepository) {}

    async execute(id: number): Promise<UserOutput> {
        const user = await this.repository.findById(id);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return UserOutput.fromDomain(UserMapper.toDomain(user as User));
    }
}
