import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { hasPermission } from '@src/modules/authentication/domain/utils/build-jwt-payload';
import type { JwtPayload } from '@src/modules/authentication/domain/types/jwt-payload';
import { PERMISSIONS_KEY } from '@src/modules/authentication/interfaces/decorators/require-permissions.decorator';
import { IS_PUBLIC_KEY } from '@src/modules/authentication/interfaces/decorators/public.decorator';
import { SUPER_ADMIN_ONLY_KEY } from '@src/modules/authentication/interfaces/decorators/require-superadmin.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const user = request.user;

    const superAdminOnly = this.reflector.getAllAndOverride<boolean>(
      SUPER_ADMIN_ONLY_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (superAdminOnly) {
      if (!user?.isSuperAdmin) {
        throw new ForbiddenException('Super administrateur requis');
      }
      return true;
    }

    const required = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required?.length) {
      return true;
    }

    if (!user) {
      throw new ForbiddenException('Missing authentication context');
    }

    if (!hasPermission(user, required)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
