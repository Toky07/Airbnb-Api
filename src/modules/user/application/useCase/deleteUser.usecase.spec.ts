import { IUserRepository } from "../../domain/repositories/user.repository";
import { DeleteUserUseCase } from "./deleteUser.usecase";

const repository = {
    delete: async (id: number): Promise<boolean> => {
        return true;
    }
} as IUserRepository;

describe('UseCase: delete user use case', () => {
  it('should delete user', async () => {
    const deleteUserUseCase = new DeleteUserUseCase(repository);

    const response = await deleteUserUseCase.execute(1);

    expect(response).toBe(true);
  });
});