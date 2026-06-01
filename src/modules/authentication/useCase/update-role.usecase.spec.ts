import { UserNameVO } from "../../user/domain/valueObject/username.vo";
import { RoleEntity } from "../domain/entities/role.entity";
import { IRoleRepository } from "../domain/repositories/role.repository";
import { UpdateRoleUseCase } from "./update-role.usecase";

const repository = {
  update: async (role: RoleEntity): Promise<RoleEntity> => {
    return role;
  },
  findById: async (id: string): Promise<RoleEntity> => {
    return {id: '1', name: new UserNameVO('test'), createdAt: new Date(), updatedAt: new Date()};
  },
} as unknown as IRoleRepository;

describe('UseCase: update role use case', () => {
  it('should update a role', () => {
    const updateRoleUseCase = new UpdateRoleUseCase(repository);
    const role = updateRoleUseCase.execute({ id: 1, name: 'test' });
    
    expect(role).toBeDefined();
  });

  it('should throw an error if the role is not found', async () => {
    const updateRoleUseCase = new UpdateRoleUseCase(repository);
    vi.spyOn(repository, 'findById').mockResolvedValue(null);
    await expect(updateRoleUseCase.execute({ id: 2, name: 'test' })).rejects.toThrow(new Error('Role not found'));
  });
});
