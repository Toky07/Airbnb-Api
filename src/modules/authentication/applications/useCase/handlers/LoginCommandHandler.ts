import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import type { TokenGenerator } from '@src/modules/authentication/domain/generator/token.generator';
import type { LoginCommand } from '@src/modules/authentication/applications/useCase/commands/LoginCommand';

export class LoginCommandHandler implements ICommandHandler<
  LoginCommand,
  string
> {
  constructor(private readonly tokenGenerator: TokenGenerator) {}

  async execute(command: LoginCommand): Promise<string> {
    return this.tokenGenerator.generate({
      email: command.email,
      password: command.password,
    });
  }
}
