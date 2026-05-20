import { TokenGenerator } from "../domain/generator/token.generator";
import { LoginUseCase } from "./login.usecase";

const tokenGenerator = {
  generate: async ({ email, password }: { email: string, password: string }): Promise<string> => {
    return 'token';
  }
} as TokenGenerator;

describe('UseCase: login use case', () => {
  it('should login', async () => {
    const loginUseCase = new LoginUseCase(tokenGenerator);
    const token = await loginUseCase.execute({
      email: 'test@test.com',
      password: 'password',
    });

    expect(token).toBe('token');
  });
});
