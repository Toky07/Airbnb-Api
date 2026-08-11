import { SUPERADMIN_ROLE_SLUG } from '@src/modules/authentication/domain/constants/permissions.constant';
import type { Auth } from '@src/modules/authentication/domain/entities/user.entity';
import type { JwtPayload } from '@src/modules/authentication/domain/types/jwt-payload';

export function buildJwtPayload(auth: Auth): JwtPayload {
  const roleSlugs = auth.roles.map((r) => r.slug).filter(Boolean);
  const isSuperAdmin = roleSlugs.includes(SUPERADMIN_ROLE_SLUG);
  const permissionSet = new Set<string>();

  for (const role of auth.roles) {
    for (const key of role.permissionKeys ?? []) {
      permissionSet.add(key);
    }
  }

  return {
    sub: auth.id!,
    email: auth.email,
    roles: roleSlugs,
    permissions: [...permissionSet],
    isSuperAdmin,
  };
}

export function hasPermission(
  payload: JwtPayload,
  required: string | string[],
): boolean {
  if (payload.isSuperAdmin) {
    return true;
  }

  const keys = Array.isArray(required) ? required : [required];
  return keys.every((key) => payload.permissions.includes(key));
}
