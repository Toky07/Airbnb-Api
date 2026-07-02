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
import type { MeOutput } from '../../application/dto/me.output';
import type { UploadFile } from '../../../media/types/upload-file';
import { UserOutput } from '../../../user/domain/dtos/user.output';
import { CommandBus } from '../../../../shared/useCase/bus/bus';
import { QueryBus } from '../../../../shared/useCase/bus/query-bus';
import { SetPasswordWithTokenCommand } from '../../useCase/commands/SetPasswordWithTokenCommand';
import { ValidatePasswordSetupTokenQuery } from '../../useCase/queries/ValidatePasswordSetupTokenQuery';
import { RegisterHostCommand } from '../../../user/application/useCase/commands/RegisterHostCommand';
import { UpdateMyProfileCommand } from '../../../user/application/useCase/commands/UpdateMyProfileCommand';
import { LoginCommand } from '../../useCase/commands/LoginCommand';
import { AssignRoleCommand } from '../../useCase/commands/AssignRoleCommand';
import { GetMeQuery } from '../../useCase/queries/GetMeQuery';

@Controller('auth')
export class AuthController {

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
    const response = await CommandBus.execute<boolean>(
      new RegisterHostCommand(registerHostDto),
    );
    return { success: Boolean(response) };
  }

  @Public()
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
  @Get('password-setup/validate')
  async validatePasswordSetup(@Query('token') token: string) {
    return QueryBus.execute(new ValidatePasswordSetupTokenQuery(token));
  }

  @Public()
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
