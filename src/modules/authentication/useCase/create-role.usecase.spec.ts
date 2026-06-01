import { RoleEntity } from "../domain/entities/role.entity";
import { IRoleRepository } from "../domain/repositories/role.repository";
import { CreateRoleUseCase } from "./create-role.usecase";

const repository = {
  create: async (role): Promise<RoleEntity> => {
    return role;
  },
} as IRoleRepository;

describe('UseCase: create role use case', () => {
  it('should create a role', () => {
    const createRoleUseCase = new CreateRoleUseCase(repository);
    const role = createRoleUseCase.execute({id: 1, name: 'test' });
    expect(role).toBeDefined();
  });
});
