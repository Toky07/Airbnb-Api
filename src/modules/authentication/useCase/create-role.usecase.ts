import { Inject } from "@nestjs/common";
import { Repository } from "typeorm";
import { ROLE_REPOSITORY } from "../domain/repositories/role.repository";
import { RoleEntity } from "../domain/entities/role.entity";
import { CreateRoleDto } from "../application/dto/create-role.dto";
import { UserNameVO } from "../../user/domain/valueObject/username.vo";


export class CreateRoleUseCase {
    constructor(@Inject(ROLE_REPOSITORY) private readonly repository: Repository<RoleEntity>) {}

    async execute(createRoleDto: CreateRoleDto): Promise<RoleEntity> {
        const role = new RoleEntity(new UserNameVO(createRoleDto.name));
        return this.repository.create(role);
    }
}
