import { Controller, Post, Body, HttpCode } from "@nestjs/common";
import { CreateCredentialsUseCase } from "../../useCase/create-credentials.usecase";
import { LoginUseCase } from "../../useCase/login.usecase";

@Controller('auth')
export class AuthController {
  constructor(
    private readonly createCredentialsUseCase: CreateCredentialsUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  @Post('create')
  async create(@Body() createCredentialsDto: { email: string, password: string }): Promise<{ success: boolean }> {
    const response = await this.createCredentialsUseCase.execute(createCredentialsDto);
    if (response) {
      return { success: true };
    }
    return { success: false };
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginCredentialsDto: { email: string, password: string }): Promise<{ token: string|null }> {
    const response = await this.loginUseCase.execute(loginCredentialsDto);

    return { token: response };
  }
}
