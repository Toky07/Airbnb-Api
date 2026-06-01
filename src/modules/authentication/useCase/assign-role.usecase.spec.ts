import { AssignRoleUseCase } from "./assign-role.usecase";
import { IAuthRepository } from "../domain/repositories/auth.repository";

const repository = {
    assignRoles: async (userId: number, roleId: number): Promise<boolean> => {
        return true;
    }
} as IAuthRepository;

describe('AssignRoleUseCase', () => {
  it('should assign a role to a user', async () => {
    const assignRoleUseCase = new AssignRoleUseCase(repository);
    const result = await assignRoleUseCase.execute(1, [1]);
    expect(result).toBe(true);
  });
});
