import {
  Controller,
  Post,
  Body,
  HttpCode,
  Get,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateCredentialsUseCase } from '../../useCase/create-credentials.usecase';
import { RegisterHostUseCase } from '../../../user/application/useCase/register-host.usecase';
import { LoginUseCase } from '../../useCase/login.usecase';
import { AssignRoleUseCase } from '../../useCase/assign-role.usecase';
import { GetMeUseCase } from '../../useCase/get-me.usecase';
import { Public } from '../decorators/public.decorator';
import { RequirePermissions } from '../decorators/require-permissions.decorator';
import type { JwtPayload } from '../../domain/types/jwt-payload';
import type { MeOutput } from '../../application/dto/me.output';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly createCredentialsUseCase: CreateCredentialsUseCase,
    private readonly registerHostUseCase: RegisterHostUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly assignRoleUseCase: AssignRoleUseCase,
    private readonly getMeUseCase: GetMeUseCase,
  ) {}

  @Public()
  @Post('register')
  async create(
    @Body()
    registerHostDto: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phoneNumber: string;
    },
  ): Promise<{ success: boolean }> {
    const response = await this.registerHostUseCase.execute(registerHostDto);
    return { success: Boolean(response) };
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() loginCredentialsDto: { email: string; password: string },
  ): Promise<{ token: string | null }> {
    const response = await this.loginUseCase.execute(loginCredentialsDto);
    return { token: response };
  }

  @Get('me')
  async me(@Req() request: { user?: JwtPayload }): Promise<MeOutput> {
    if (!request.user?.sub) {
      throw new UnauthorizedException();
    }
    return this.getMeUseCase.execute(request.user.sub);
  }

  @Post('assign-role')
  @HttpCode(200)
  @RequirePermissions('roles.manage')
  async assignRole(
    @Body() assignRoleDto: { userId: number; roleId: number[] },
  ): Promise<{ success: boolean }> {
    const response = await this.assignRoleUseCase.execute(
      assignRoleDto.userId,
      assignRoleDto.roleId,
    );
    return { success: response };
  }
}
