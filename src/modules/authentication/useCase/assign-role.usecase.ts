import { Inject } from "@nestjs/common";
import { AUTH_REPOSITORY, type IAuthRepository } from "../domain/repositories/auth.repository";

export class AssignRoleUseCase {
    constructor(@Inject(AUTH_REPOSITORY) private readonly repository: IAuthRepository) {}

    async execute(userId: number, roleId: number[]): Promise<boolean> {
        return this.repository.assignRoles(userId, roleId);
    }
}