import { TokenGenerator } from "../domain/generator/token.generator";

export class LoginUseCase {
  constructor(private readonly tokenGenerator: TokenGenerator) {}

  async execute({ email, password }: { email: string, password: string }): Promise<string> {
    return this.tokenGenerator.generate({ email, password });
  }
}
