import {
  Controller,
  Post,
  Body,
  HttpCode,
  Get,
  Put,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { parseMyProfileBody } from '@src/modules/user/contracts';
import { Public } from '@src/modules/authentication/interfaces/decorators/public.decorator';
import { RequirePermissions } from '@src/modules/authentication/interfaces/decorators/require-permissions.decorator';
import type { JwtPayload } from '@src/modules/authentication/domain/types/jwt-payload';
import type { MeOutput } from '@src/modules/authentication/applications/dto/me.output';
import type { UploadFile } from '@src/modules/media/contracts';
import { getImageMulterOptions } from '@src/modules/media/contracts';
import { UserOutput } from '@src/modules/user/contracts';
import { CommandBus } from '@src/shared/useCase/bus/bus';
import { QueryBus } from '@src/shared/useCase/bus/query-bus';
import { SetPasswordWithTokenCommand } from '@src/modules/authentication/applications/useCase/commands/SetPasswordWithTokenCommand';
import { ValidatePasswordSetupTokenQuery } from '@src/modules/authentication/applications/useCase/queries/ValidatePasswordSetupTokenQuery';
import {
  AUTH_LOGIN_THROTTLE,
  AUTH_PASSWORD_SETUP_THROTTLE,
  AUTH_REGISTER_THROTTLE,
} from '@src/config/throttle.config';
import { SensitiveRouteThrottle } from '@src/shared/decorators/sensitive-route-throttle.decorator';
import { RegisterHostCommand } from '@src/modules/user/contracts';
import { UpdateMyProfileCommand } from '@src/modules/user/contracts';
import { LoginCommand } from '@src/modules/authentication/applications/useCase/commands/LoginCommand';
import { AssignRoleCommand } from '@src/modules/authentication/applications/useCase/commands/AssignRoleCommand';
import { ResetPasswordWithTokenCommand } from '@src/modules/authentication/applications/useCase/commands/ResetPasswordWithTokenCommand';
import { RequestPasswordResetCommand } from '@src/modules/authentication/applications/useCase/commands/RequestPasswordResetCommand';
import { ValidatePasswordResetTokenQuery } from '@src/modules/authentication/applications/useCase/queries/ValidatePasswordResetTokenQuery';
import { GetMeQuery } from '@src/modules/authentication/applications/useCase/queries/GetMeQuery';
import { BecomeHostCommand } from '@src/modules/authentication/applications/useCase/commands/BecomeHostCommand';
import { AssignRoleDto } from '@src/modules/authentication/applications/dto/assign-role.dto';
import { ForgotPasswordDto } from '@src/modules/authentication/applications/dto/forgot-password.dto';
import { LoginDto } from '@src/modules/authentication/applications/dto/login.dto';
import { LoginResponseDto } from '@src/modules/authentication/applications/dto/login-response.dto';
import { RegisterDto } from '@src/modules/authentication/applications/dto/register.dto';
import { SuccessResponseDto } from '@src/modules/authentication/applications/dto/success-response.dto';
import { TokenPasswordDto } from '@src/modules/authentication/applications/dto/token-password.dto';
import { TokenDto } from '@src/modules/authentication/applications/dto/token.dto';
import { TokenResponseDto } from '@src/modules/authentication/applications/dto/token-response.dto';
import { ApiJwtAuth } from '@src/shared/swagger/swagger.decorators';
import { SWAGGER_TAGS } from '@src/shared/swagger/swagger.constants';

@ApiTags(SWAGGER_TAGS.AUTH)
@Controller('auth')
export class AuthController {
  @Public()
  @SensitiveRouteThrottle(AUTH_REGISTER_THROTTLE)
  @Post('register')
  @ApiOperation({ summary: 'Inscription voyageur' })
  async create(
    @Body() registerHostDto: RegisterDto,
  ): Promise<SuccessResponseDto> {
    const response = await CommandBus.execute<boolean>(
      new RegisterHostCommand(registerHostDto),
    );
    return { success: Boolean(response) };
  }

  @Public()
  @SensitiveRouteThrottle(AUTH_LOGIN_THROTTLE)
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Connexion — retourne un JWT' })
  async login(
    @Body() loginCredentialsDto: LoginDto,
  ): Promise<LoginResponseDto> {
    const response = await CommandBus.execute<string>(
      new LoginCommand(loginCredentialsDto.email, loginCredentialsDto.password),
    );
    return { token: response };
  }

  @Public()
  @SensitiveRouteThrottle(AUTH_PASSWORD_SETUP_THROTTLE)
  @Post('password-setup/validate')
  @HttpCode(200)
  @ApiOperation({ summary: "Valider un token d'invitation mot de passe" })
  async validatePasswordSetup(@Body() body: TokenDto) {
    return QueryBus.execute(new ValidatePasswordSetupTokenQuery(body.token));
  }

  @Public()
  @SensitiveRouteThrottle(AUTH_PASSWORD_SETUP_THROTTLE)
  @Post('password-setup')
  @HttpCode(200)
  @ApiOperation({ summary: 'Définir le mot de passe via invitation' })
  async setPassword(
    @Body() body: TokenPasswordDto,
  ): Promise<SuccessResponseDto> {
    await CommandBus.execute(
      new SetPasswordWithTokenCommand(body.token, body.password),
    );
    return { success: true };
  }

  @Public()
  @SensitiveRouteThrottle(AUTH_PASSWORD_SETUP_THROTTLE)
  @Post('forgot-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Demander une réinitialisation de mot de passe' })
  async forgotPassword(
    @Body() body: ForgotPasswordDto,
  ): Promise<SuccessResponseDto> {
    await CommandBus.execute(new RequestPasswordResetCommand(body.email));
    return { success: true };
  }

  @Public()
  @SensitiveRouteThrottle(AUTH_PASSWORD_SETUP_THROTTLE)
  @Post('reset-password/validate')
  @HttpCode(200)
  @ApiOperation({ summary: 'Valider un token de réinitialisation' })
  async validatePasswordReset(@Body() body: TokenDto) {
    return QueryBus.execute(new ValidatePasswordResetTokenQuery(body.token));
  }

  @Public()
  @SensitiveRouteThrottle(AUTH_PASSWORD_SETUP_THROTTLE)
  @Post('reset-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Réinitialiser le mot de passe' })
  async resetPassword(
    @Body() body: TokenPasswordDto,
  ): Promise<SuccessResponseDto> {
    await CommandBus.execute(
      new ResetPasswordWithTokenCommand(body.token, body.password),
    );
    return { success: true };
  }

  @Get('me')
  @ApiJwtAuth()
  @ApiOperation({ summary: "Profil et permissions de l'utilisateur connecté" })
  async me(@Req() request: { user?: JwtPayload }): Promise<MeOutput> {
    if (!request.user?.sub) {
      throw new UnauthorizedException();
    }
    return QueryBus.execute(new GetMeQuery(request.user.sub));
  }

  @Post('become-host')
  @HttpCode(200)
  @ApiJwtAuth()
  @ApiOperation({ summary: 'Passer au rôle hôte — retourne un nouveau JWT' })
  async becomeHost(
    @Req() request: { user?: JwtPayload },
  ): Promise<TokenResponseDto> {
    if (!request.user?.sub) {
      throw new UnauthorizedException();
    }

    const token = await CommandBus.execute<string>(
      new BecomeHostCommand(request.user.sub),
    );
    return { token };
  }

  @Put('profile')
  @ApiJwtAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Mettre à jour son profil (avatar optionnel)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        phoneNumber: { type: 'string' },
        avatar: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('avatar', getImageMulterOptions()))
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
  @ApiJwtAuth()
  @ApiOperation({ summary: 'Assigner des rôles à un utilisateur (admin)' })
  async assignRole(
    @Req() request: { user?: JwtPayload },
    @Body() assignRoleDto: AssignRoleDto,
  ): Promise<SuccessResponseDto> {
    const response = await CommandBus.execute<boolean>(
      new AssignRoleCommand(
        assignRoleDto.userId,
        assignRoleDto.roleId,
        request.user?.isSuperAdmin === true,
      ),
    );
    return { success: response };
  }
}
