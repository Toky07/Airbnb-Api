import {
  Controller,
  Post,
  Body,
  HttpCode,
  Get,
  Put,
  Req,
  UnauthorizedException,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateCredentialsUseCase } from '../../useCase/create-credentials.usecase';
import { RegisterHostUseCase } from '../../../user/application/useCase/register-host.usecase';
import { UpdateMyProfileUseCase } from '../../../user/application/useCase/update-my-profile.usecase';
import { parseMyProfileBody } from '../../../user/interfaces/http/parse-my-profile-body';
import { LoginUseCase } from '../../useCase/login.usecase';
import { AssignRoleUseCase } from '../../useCase/assign-role.usecase';
import { GetMeUseCase } from '../../useCase/get-me.usecase';
import { Public } from '../decorators/public.decorator';
import { RequirePermissions } from '../decorators/require-permissions.decorator';
import type { JwtPayload } from '../../domain/types/jwt-payload';
import type { MeOutput } from '../../application/dto/me.output';
import type { UploadFile } from '../../../media/types/upload-file';
import { UserOutput } from '../../../user/domain/dtos/user.output';
import { ValidatePasswordSetupTokenUseCase } from '../../../account-activation/application/useCase/validate-password-setup-token.usecase';
import { SetPasswordWithTokenUseCase } from '../../../account-activation/application/useCase/set-password-with-token.usecase';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly createCredentialsUseCase: CreateCredentialsUseCase,
    private readonly registerHostUseCase: RegisterHostUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly assignRoleUseCase: AssignRoleUseCase,
    private readonly getMeUseCase: GetMeUseCase,
    private readonly updateMyProfileUseCase: UpdateMyProfileUseCase,
    private readonly validatePasswordSetupTokenUseCase: ValidatePasswordSetupTokenUseCase,
    private readonly setPasswordWithTokenUseCase: SetPasswordWithTokenUseCase,
  ) {}

  @Public()
  @Post('register')
  async create(
    @Body()
    registerHostDto: {
      email: string;
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

  @Public()
  @Get('password-setup/validate')
  async validatePasswordSetup(@Query('token') token: string) {
    return this.validatePasswordSetupTokenUseCase.execute(token);
  }

  @Public()
  @Post('password-setup')
  @HttpCode(200)
  async setPassword(
    @Body() body: { token: string; password: string },
  ): Promise<{ success: boolean }> {
    await this.setPasswordWithTokenUseCase.execute(body.token, body.password);
    return { success: true };
  }

  @Get('me')
  async me(@Req() request: { user?: JwtPayload }): Promise<MeOutput> {
    if (!request.user?.sub) {
      throw new UnauthorizedException();
    }
    return this.getMeUseCase.execute(request.user.sub);
  }

  @Put('profile')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateProfile(
    @Req() request: { user?: JwtPayload },
    @Body() body: Record<string, unknown>,
    @UploadedFile() avatar?: UploadFile,
  ): Promise<UserOutput> {
    if (!request.user?.sub) {
      throw new UnauthorizedException();
    }

    return this.updateMyProfileUseCase.execute(
      request.user.sub,
      parseMyProfileBody(body),
      avatar,
    );
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
