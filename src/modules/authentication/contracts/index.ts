/**
 * Surface publique du module authentication.
 * Les autres modules doivent importer uniquement depuis ce barrel
 * (sauf AuthModule Nest et ORM AuthEntity).
 */
export {
  AUTH_REPOSITORY,
  type IAuthRepository,
} from '@src/modules/authentication/domain/repositories/auth.repository';
export {
  ROLE_REPOSITORY,
  type IRoleRepository,
} from '@src/modules/authentication/domain/repositories/role.repository';
export {
  ACCOUNT_STATUS,
  ADMIN_MANAGEABLE_ACCOUNT_STATUSES,
  type AccountStatus,
  type AdminManageableAccountStatus,
} from '@src/modules/authentication/domain/constants/account-status.constant';
export {
  ALL_PERMISSION_KEYS,
  HOST_ROLE_SLUG,
  SUPERADMIN_ROLE_SLUG,
  TRAVELER_ROLE_SLUG,
} from '@src/modules/authentication/domain/constants/permissions.constant';
export {
  isPermissionLockedRoleSlug,
  isSystemRoleSlug,
  SYSTEM_ROLE_SLUGS,
  type SystemRoleSlug,
} from '@src/modules/authentication/domain/constants/system-roles.constant';
export { hasPermission } from '@src/modules/authentication/domain/utils/build-jwt-payload';
export { SendAccountInvitationCommand } from '@src/modules/authentication/applications/useCase/commands/SendAccountInvitationCommand';
export { CreateRoleCommand } from '@src/modules/authentication/applications/useCase/commands/CreateRoleCommand';
export { UpdateRoleCommand } from '@src/modules/authentication/applications/useCase/commands/UpdateRoleCommand';
export { SetRolePermissionsCommand } from '@src/modules/authentication/applications/useCase/commands/SetRolePermissionsCommand';
export { RoleOutput } from '@src/modules/authentication/applications/dto/role.output';
export { RequirePermissions } from '@src/modules/authentication/interfaces/decorators/require-permissions.decorator';
export { RequireSuperAdmin } from '@src/modules/authentication/interfaces/decorators/require-superadmin.decorator';
export { Public } from '@src/modules/authentication/interfaces/decorators/public.decorator';
export { AccountStatusResolver } from '@src/modules/authentication/domain/services/account-status.resolver';
export { Auth } from '@src/modules/authentication/domain/entities/user.entity';
export type { JwtPayload } from '@src/modules/authentication/domain/types/jwt-payload';
