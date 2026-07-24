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
import { parseMyProfileBody } from '../../../user/interfaces/http/parse-my-profile-body';
import { Public } from '../decorators/public.decorator';
import { RequirePermissions } from '../decorators/require-permissions.decorator';
import type { JwtPayload } from '../../domain/types/jwt-payload';
import type { MeOutput } from '../../applications/dto/me.output';
import type { UploadFile } from '../../../media/types/upload-file';
import { UserOutput } from '../../../user/domain/dtos/user.output';
import { CommandBus } from '../../../../shared/useCase/bus/bus';
import { QueryBus } from '../../../../shared/useCase/bus/query-bus';
import { SetPasswordWithTokenCommand } from '../../applications/useCase/commands/SetPasswordWithTokenCommand';
import { ValidatePasswordSetupTokenQuery } from '../../applications/useCase/queries/ValidatePasswordSetupTokenQuery';
import {
  AUTH_LOGIN_THROTTLE,
  AUTH_PASSWORD_SETUP_THROTTLE,
  AUTH_REGISTER_THROTTLE,
} from '../../../../config/throttle.config';
import { SensitiveRouteThrottle } from '../../../../shared/decorators/sensitive-route-throttle.decorator';
import { RegisterHostCommand } from '../../../user/applications/useCase/commands/RegisterHostCommand';
import { UpdateMyProfileCommand } from '../../../user/applications/useCase/commands/UpdateMyProfileCommand';
import { LoginCommand } from '../../applications/useCase/commands/LoginCommand';
import { AssignRoleCommand } from '../../applications/useCase/commands/AssignRoleCommand';
import { ResetPasswordWithTokenCommand } from '../../applications/useCase/commands/ResetPasswordWithTokenCommand';
import { RequestPasswordResetCommand } from '../../applications/useCase/commands/RequestPasswordResetCommand';
import { ValidatePasswordResetTokenQuery } from '../../applications/useCase/queries/ValidatePasswordResetTokenQuery';
import { GetMeQuery } from '../../applications/useCase/queries/GetMeQuery';

@Controller('auth')
export class AuthController {
  @Public()
  @SensitiveRouteThrottle(AUTH_REGISTER_THROTTLE)
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
    const response = await CommandBus.execute<boolean>(
      new RegisterHostCommand(registerHostDto),
    );
    return { success: Boolean(response) };
  }

  @Public()
  @SensitiveRouteThrottle(AUTH_LOGIN_THROTTLE)
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() loginCredentialsDto: { email: string; password: string },
  ): Promise<{ token: string | null }> {
    const response = await CommandBus.execute<string>(
      new LoginCommand(loginCredentialsDto.email, loginCredentialsDto.password),
    );
    return { token: response };
  }

  @Public()
  @SensitiveRouteThrottle(AUTH_PASSWORD_SETUP_THROTTLE)
  @Get('password-setup/validate')
  async validatePasswordSetup(@Query('token') token: string) {
    return QueryBus.execute(new ValidatePasswordSetupTokenQuery(token));
  }

  @Public()
  @SensitiveRouteThrottle(AUTH_PASSWORD_SETUP_THROTTLE)
  @Post('password-setup')
  @HttpCode(200)
  async setPassword(
    @Body() body: { token: string; password: string },
  ): Promise<{ success: boolean }> {
    await CommandBus.execute(
      new SetPasswordWithTokenCommand(body.token, body.password),
    );
    return { success: true };
  }

  @Public()
  @SensitiveRouteThrottle(AUTH_PASSWORD_SETUP_THROTTLE)
  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(
    @Body() body: { email: string },
  ): Promise<{ success: boolean }> {
    await CommandBus.execute(new RequestPasswordResetCommand(body.email));
    return { success: true };
  }

  @Public()
  @SensitiveRouteThrottle(AUTH_PASSWORD_SETUP_THROTTLE)
  @Get('reset-password/validate')
  async validatePasswordReset(@Query('token') token: string) {
    return QueryBus.execute(new ValidatePasswordResetTokenQuery(token));
  }

  @Public()
  @SensitiveRouteThrottle(AUTH_PASSWORD_SETUP_THROTTLE)
  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(
    @Body() body: { token: string; password: string },
  ): Promise<{ success: boolean }> {
    await CommandBus.execute(
      new ResetPasswordWithTokenCommand(body.token, body.password),
    );
    return { success: true };
  }

  @Get('me')
  async me(@Req() request: { user?: JwtPayload }): Promise<MeOutput> {
    if (!request.user?.sub) {
      throw new UnauthorizedException();
    }
    return QueryBus.execute(new GetMeQuery(request.user.sub));
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

    return CommandBus.execute(
      new UpdateMyProfileCommand(
        request.user.sub,
        parseMyProfileBody(body),
        avatar,
      ),
    );
  }

  @Post('assign-role')
  @HttpCode(200)
  @RequirePermissions('roles.manage')
  async assignRole(
    @Body() assignRoleDto: { userId: number; roleId: number[] },
  ): Promise<{ success: boolean }> {
    const response = await CommandBus.execute<boolean>(
      new AssignRoleCommand(assignRoleDto.userId, assignRoleDto.roleId),
    );
    return { success: response };
  }
}
