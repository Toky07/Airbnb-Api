import { SUPERADMIN_ROLE_SLUG, HOST_ROLE_SLUG } from './permissions.constant';
import {
  TRAVELER_ROLE_SLUG,
  isPermissionLockedRoleSlug,
  isSystemRoleSlug,
} from './system-roles.constant';

describe('system-roles.constant', () => {
  it('identifies system role slugs', () => {
    expect(isSystemRoleSlug(SUPERADMIN_ROLE_SLUG)).toBe(true);
    expect(isSystemRoleSlug(HOST_ROLE_SLUG)).toBe(true);
    expect(isSystemRoleSlug(TRAVELER_ROLE_SLUG)).toBe(true);
    expect(isSystemRoleSlug('custom')).toBe(false);
  });

  it('locks permissions only for superadmin', () => {
    expect(isPermissionLockedRoleSlug(SUPERADMIN_ROLE_SLUG)).toBe(true);
    expect(isPermissionLockedRoleSlug(HOST_ROLE_SLUG)).toBe(false);
    expect(isPermissionLockedRoleSlug(TRAVELER_ROLE_SLUG)).toBe(false);
  });
});
