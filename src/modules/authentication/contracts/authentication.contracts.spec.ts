import { describe, expect, it } from 'vitest';
import {
  ACCOUNT_STATUS,
  ALL_PERMISSION_KEYS,
  AUTH_REPOSITORY,
  CreateRoleCommand,
  ROLE_REPOSITORY,
  TRAVELER_ROLE_SLUG,
  hasPermission,
  isSystemRoleSlug,
  SendAccountInvitationCommand,
} from './index';

describe('authentication/contracts', () => {
  it('expose tokens, constantes, helpers et commands publics', () => {
    expect(AUTH_REPOSITORY).toBe('AUTH_REPOSITORY');
    expect(ROLE_REPOSITORY).toBe('ROLE_REPOSITORY');
    expect(ACCOUNT_STATUS.ACTIVE).toBe('active');
    expect(TRAVELER_ROLE_SLUG).toBe('traveler');
    expect(ALL_PERMISSION_KEYS.length).toBeGreaterThan(0);
    expect(isSystemRoleSlug(TRAVELER_ROLE_SLUG)).toBe(true);
    expect(
      hasPermission(
        {
          sub: 1,
          email: 'a@b.c',
          roles: [],
          permissions: ['users.read'],
          isSuperAdmin: false,
        },
        'users.read',
      ),
    ).toBe(true);
    expect(new SendAccountInvitationCommand({ userId: 1 })).toBeInstanceOf(
      SendAccountInvitationCommand,
    );
    expect(new CreateRoleCommand({ name: 'editor' })).toBeInstanceOf(
      CreateRoleCommand,
    );
  });
});
