import {
  HOST_ROLE_SLUG,
  SUPERADMIN_ROLE_SLUG,
  TRAVELER_ROLE_SLUG,
} from './permissions.constant';

export { TRAVELER_ROLE_SLUG };

export const SYSTEM_ROLE_SLUGS = [
  SUPERADMIN_ROLE_SLUG,
  HOST_ROLE_SLUG,
  TRAVELER_ROLE_SLUG,
] as const;

export type SystemRoleSlug = (typeof SYSTEM_ROLE_SLUGS)[number];

export function isSystemRoleSlug(slug: string): boolean {
  return (SYSTEM_ROLE_SLUGS as readonly string[]).includes(slug);
}

export function isPermissionLockedRoleSlug(slug: string): boolean {
  return slug === SUPERADMIN_ROLE_SLUG;
}
