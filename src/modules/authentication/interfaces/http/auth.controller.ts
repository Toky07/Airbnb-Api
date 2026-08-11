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
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { parseMyProfileBody } from '../../../user/interfaces/http/parse-my-profile-body';
import { Public } from '../decorators/public.decorator';
import { RequirePermissions } from '../decorators/require-permissions.decorator';
import type { JwtPayload } from '../../domain/types/jwt-payload';
import type { MeOutput } from '../../applications/dto/me.output';
import type { UploadFile } from '../../../media/contracts';
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
import { BecomeHostCommand } from '../../applications/useCase/commands/BecomeHostCommand';
import {
  AssignRoleDto,
  ForgotPasswordDto,
  LoginDto,
  LoginResponseDto,
  RegisterDto,
  SuccessResponseDto,
  TokenPasswordDto,
  TokenResponseDto,
} from '../../applications/dto/auth-http.dto';
import { ApiJwtAuth } from '../../../../shared/swagger/swagger.decorators';
import { SWAGGER_TAGS } from '../../../../shared/swagger/swagger.constants';

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
  @Get('password-setup/validate')
  @ApiOperation({ summary: "Valider un token d'invitation mot de passe" })
  @ApiQuery({ name: 'token', required: true })
  async validatePasswordSetup(@Query('token') token: string) {
    return QueryBus.execute(new ValidatePasswordSetupTokenQuery(token));
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
  @Get('reset-password/validate')
  @ApiOperation({ summary: 'Valider un token de réinitialisation' })
  @ApiQuery({ name: 'token', required: true })
  async validatePasswordReset(@Query('token') token: string) {
    return QueryBus.execute(new ValidatePasswordResetTokenQuery(token));
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
  @ApiJwtAuth()
  @ApiOperation({ summary: 'Assigner des rôles à un utilisateur (admin)' })
  async assignRole(
    @Body() assignRoleDto: AssignRoleDto,
  ): Promise<SuccessResponseDto> {
    const response = await CommandBus.execute<boolean>(
      new AssignRoleCommand(assignRoleDto.userId, assignRoleDto.roleId),
    );
    return { success: response };
  }
}
