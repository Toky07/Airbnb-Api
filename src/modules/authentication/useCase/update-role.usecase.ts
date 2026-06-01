import { Inject, NotFoundException } from "@nestjs/common";
import { type IRoleRepository, ROLE_REPOSITORY } from "../domain/repositories/role.repository";
import { UpdateRoleDto } from "../application/dto/update-role.dto";
import { UserNameVO } from "../../user/domain/valueObject/username.vo";
import { RoleOutput } from "../application/dto/role.output";

export class UpdateRoleUseCase {
  constructor(@Inject(ROLE_REPOSITORY) private readonly repository: IRoleRepository) {}

  async execute(updateRoleDto: UpdateRoleDto): Promise<RoleOutput> {
    const role = await this.repository.findById(updateRoleDto.id);
    
    if (!role) {
      throw new Error('Role not found');
    }
    role.name = new UserNameVO(updateRoleDto.name);

    const updatedRole = await this.repository.update(role);
    
    return RoleOutput.fromDomain(updatedRole);
  }
}
