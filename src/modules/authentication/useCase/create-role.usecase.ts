import { Inject } from "@nestjs/common";
import { Repository } from "typeorm";
import { ROLE_REPOSITORY } from "../domain/repositories/role.repository";
import { RoleEntity } from "../domain/entities/role.entity";
import { CreateRoleDto } from "../application/dto/create-role.dto";
import { UserNameVO } from "../../user/domain/valueObject/username.vo";
import { RoleOutput } from "../application/dto/role.output";


export class CreateRoleUseCase {
    constructor(@Inject(ROLE_REPOSITORY) private readonly repository: Repository<RoleEntity>) {}

    async execute(createRoleDto: CreateRoleDto): Promise<RoleOutput> {
        const role = new RoleEntity(new UserNameVO(createRoleDto.name));
        const newRole = await this.repository.create(role);

        return RoleOutput.fromDomain(newRole);
    }
}
