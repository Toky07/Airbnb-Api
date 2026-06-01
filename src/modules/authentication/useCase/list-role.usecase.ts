import { Inject } from "@nestjs/common";
import { RoleOutput } from "../application/dto/role.output";
import { type IRoleRepository, ROLE_REPOSITORY } from "../domain/repositories/role.repository";
import { RoleEntity } from "../domain/entities/role.entity";

export class ListRolesUseCase {
    constructor(@Inject(ROLE_REPOSITORY) private readonly repository: IRoleRepository) {}

    async execute(): Promise<RoleOutput[]> {
        const allRoles = await this.repository.findAll();
        
        return allRoles.map((role: RoleEntity) => RoleOutput.fromDomain(role));
    }
}
