import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '@src/modules/authentication/interfaces/decorators/public.decorator';
import { AUTH_REPOSITORY } from '@src/modules/authentication/domain/repositories/auth.repository';
import type { IAuthRepository } from '@src/modules/authentication/domain/repositories/auth.repository';
import { buildJwtPayload } from '@src/modules/authentication/domain/utils/build-jwt-payload';
import type { Auth } from '@src/modules/authentication/domain/entities/user.entity';

const JWT_STALE_SKEW_MS = 2000;

/**
 * Un JWT est considéré comme révoqué si le compte auth a été modifié
 * (mot de passe, statut, rôles) après son émission.
 * Les écritures no-op sur `auth` (seed / sync au boot) ne doivent pas
 * toucher `updatedAt`, sinon toutes les sessions sont déconnectées.
 */
function isCredentialRevoked(auth: Auth, issuedAtSeconds?: number): boolean {
  if (!auth.isActive) {
    return true;
  }

  if (!auth.updatedAt || issuedAtSeconds == null) {
    return false;
  }

  return issuedAtSeconds * 1000 + JWT_STALE_SKEW_MS < auth.updatedAt.getTime();
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    @Inject(AUTH_REPOSITORY) private readonly authRepository: IAuthRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (token) {
      try {
        const payload = await this.jwtService.verifyAsync<{
          sub?: number;
          iat?: number;
        }>(token);
        const authId = payload.sub;

        if (typeof authId === 'number') {
          const auth = await this.authRepository.findById(authId);
          if (auth?.id && !isCredentialRevoked(auth, payload.iat)) {
            request['user'] = buildJwtPayload(auth);
          } else if (!isPublic) {
            throw new UnauthorizedException();
          }
        }
      } catch (error) {
        if (!isPublic) {
          if (error instanceof UnauthorizedException) {
            throw error;
          }
          throw new UnauthorizedException();
        }
      }
    }

    if (isPublic) {
      return true;
    }

    if (!token || !request['user']) {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
