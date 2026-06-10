import { Inject } from "@nestjs/common";
import { TOKEN_GENERATOR, type TokenGenerator } from "../domain/generator/token.generator";

export class LoginUseCase {
  constructor(@Inject(TOKEN_GENERATOR) private readonly tokenGenerator: TokenGenerator) {}

  async execute({ email, password }: { email: string, password: string }): Promise<string> {
    console.log('email', email);
    console.log('password', password);
    return this.tokenGenerator.generate({ email, password });
  }
}
