import { describe, expect, it } from 'vitest';
import {
  ACCOUNT_STATUS,
  AUTH_REPOSITORY,
  ROLE_REPOSITORY,
  TRAVELER_ROLE_SLUG,
  SendAccountInvitationCommand,
} from './index';

describe('authentication/contracts', () => {
  it('expose tokens, constantes et commands publics', () => {
    expect(AUTH_REPOSITORY).toBe('AUTH_REPOSITORY');
    expect(ROLE_REPOSITORY).toBe('ROLE_REPOSITORY');
    expect(ACCOUNT_STATUS.ACTIVE).toBe('active');
    expect(TRAVELER_ROLE_SLUG).toBe('traveler');
    expect(new SendAccountInvitationCommand({ userId: 1 })).toBeInstanceOf(
      SendAccountInvitationCommand,
    );
  });
});
