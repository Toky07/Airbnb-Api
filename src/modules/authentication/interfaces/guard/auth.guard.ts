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
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AUTH_REPOSITORY } from '../../domain/repositories/auth.repository';
import type { IAuthRepository } from '../../domain/repositories/auth.repository';
import { buildJwtPayload } from '../../domain/utils/build-jwt-payload';

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
        const payload = await this.jwtService.verifyAsync<{ sub?: number }>(
          token,
        );
        const authId = payload.sub;

        if (typeof authId === 'number') {
          const auth = await this.authRepository.findById(authId);
          if (auth?.id) {
            request['user'] = buildJwtPayload(auth);
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
