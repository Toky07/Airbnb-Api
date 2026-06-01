import { Inject } from "@nestjs/common";
import { type IRoleRepository, ROLE_REPOSITORY } from "../domain/repositories/role.repository";

export class DeleteRoleUseCase {
  constructor(@Inject(ROLE_REPOSITORY) private readonly repository: IRoleRepository) {}

  async execute(id: number): Promise<boolean> {
    const role = await this.repository.findById(id);
    
    if (!role) {
      throw new Error('Role not found');
    }

    return this.repository.delete(id);
  }
}
