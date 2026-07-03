import { TokenGenerator } from '../../domain/generator/token.generator';
import { LoginCommandHandler } from './LoginCommandHandler';
import { LoginCommand } from '../commands/LoginCommand';

const tokenGenerator = {
  generate: async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<string> => {
    return 'token';
  },
};

describe('LoginCommandHandler', () => {
  it('should login', async () => {
    const handler = new LoginCommandHandler(tokenGenerator);
    const token = await handler.execute(
      new LoginCommand('test@test.com', 'password'),
    );

    expect(token).toBe('token');
  });
});
