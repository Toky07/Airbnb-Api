import { TokenGenerator } from '@src/modules/authentication/domain/generator/token.generator';
import { LoginCommandHandler } from './LoginCommandHandler';
import { LoginCommand } from '@src/modules/authentication/applications/useCase/commands/LoginCommand';

const tokenGenerator = {
  generate: async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<string> => {
    void email;
    void password;
    return 'token';
  },
  generateForAuthId: async (authId: number): Promise<string> => {
    void authId;
    return 'token';
  },
} satisfies TokenGenerator;

describe('LoginCommandHandler', () => {
  it('should login', async () => {
    const handler = new LoginCommandHandler(tokenGenerator);
    const token = await handler.execute(
      new LoginCommand('test@test.com', 'password'),
    );

    expect(token).toBe('token');
  });
});
