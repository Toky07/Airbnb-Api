import type { ICommandHandler } from '../../../../shared/useCase/bus/command-handler.interface';
import type { TokenGenerator } from '../../domain/generator/token.generator';
import type { LoginCommand } from '../commands/LoginCommand';

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
