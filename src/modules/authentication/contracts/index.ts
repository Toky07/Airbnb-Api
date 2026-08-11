/**
 * Surface publique du module authentication.
 * Les autres modules doivent importer uniquement depuis ce barrel
 * (sauf AuthModule Nest et ORM AuthEntity).
 */
export {
  AUTH_REPOSITORY,
  type IAuthRepository,
} from '../domain/repositories/auth.repository';
export {
  ROLE_REPOSITORY,
  type IRoleRepository,
} from '../domain/repositories/role.repository';
export {
  ACCOUNT_STATUS,
  ADMIN_MANAGEABLE_ACCOUNT_STATUSES,
  type AccountStatus,
  type AdminManageableAccountStatus,
} from '../domain/constants/account-status.constant';
export {
  ALL_PERMISSION_KEYS,
  HOST_ROLE_SLUG,
  SUPERADMIN_ROLE_SLUG,
  TRAVELER_ROLE_SLUG,
} from '../domain/constants/permissions.constant';
export {
  isPermissionLockedRoleSlug,
  isSystemRoleSlug,
  SYSTEM_ROLE_SLUGS,
  type SystemRoleSlug,
} from '../domain/constants/system-roles.constant';
export { hasPermission } from '../domain/utils/build-jwt-payload';
export { SendAccountInvitationCommand } from '../applications/useCase/commands/SendAccountInvitationCommand';
export { CreateRoleCommand } from '../applications/useCase/commands/CreateRoleCommand';
export { UpdateRoleCommand } from '../applications/useCase/commands/UpdateRoleCommand';
export { SetRolePermissionsCommand } from '../applications/useCase/commands/SetRolePermissionsCommand';
export { RoleOutput } from '../applications/dto/role.output';
export { RequirePermissions } from '../interfaces/decorators/require-permissions.decorator';
export { RequireSuperAdmin } from '../interfaces/decorators/require-superadmin.decorator';
export { Public } from '../interfaces/decorators/public.decorator';
export { AccountStatusResolver } from '../domain/services/account-status.resolver';
export { Auth } from '../domain/entities/user.entity';
export type { JwtPayload } from '../domain/types/jwt-payload';
