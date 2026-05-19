import { Inject, Injectable } from "@nestjs/common";
import { User } from "../../domain/entities/user.entity";
import type { IUserRepository } from "../../domain/repositories/user.repository";
import { USER_REPOSITORY } from "../../infrastructure/repositories/user.repository";
import { UserOutput } from "../../domain/dtos/user.output";

@Injectable()
export class ListUsersUseCase {
    constructor(@Inject(USER_REPOSITORY) private readonly repository: IUserRepository) {}

    async execute(): Promise<UserOutput[]> {
        const users = await this.repository.findAll();

        return users.map(user => UserOutput.fromDomain(user));
    }
}
