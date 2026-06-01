import { Inject, NotFoundException } from "@nestjs/common";
import { type IRoleRepository, ROLE_REPOSITORY } from "../domain/repositories/role.repository";
import { RoleEntity } from "../domain/entities/role.entity";
import { UpdateRoleDto } from "../application/dto/update-role.dto";
import { UserNameVO } from "../../user/domain/valueObject/username.vo";

export class UpdateRoleUseCase {
  constructor(@Inject(ROLE_REPOSITORY) private readonly repository: IRoleRepository) {}

  async execute(updateRoleDto: UpdateRoleDto): Promise<RoleEntity> {
    const role = await this.repository.findById(updateRoleDto.id);
    
    if (!role) {
      throw new Error('Role not found');
    }
    role.name = new UserNameVO(updateRoleDto.name);

    return this.repository.update(role);
  }
}
