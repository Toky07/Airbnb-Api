import { IAuthRepository } from "../domain/repositories/auth.repository";
import { AuthEntity } from "../infrastructure/entity/auth.entity";
import { CreateCredentialsUseCase } from "./create-credentials.usecase";

const repository = {
  create: async (credentials: AuthEntity): Promise<boolean> => {
    return true;
  }
} as IAuthRepository;

describe('UseCase: create credentials use case', () => {
  it('should create credentials', async () => {
    const createCredentialsUseCase = new CreateCredentialsUseCase(repository);
    const credentials = await createCredentialsUseCase.execute({
      email: 'test@test.com',
      password: 'password',
    } as AuthEntity);

    expect(credentials).toBe(true);
  });
});
