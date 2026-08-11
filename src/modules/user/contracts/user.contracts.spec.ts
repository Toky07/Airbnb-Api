import { describe, expect, it } from 'vitest';
import { RegisterHostCommand, USER_REPOSITORY, UserNameVO } from './index';

describe('user/contracts', () => {
  it('expose tokens, VO et commands publics', () => {
    expect(USER_REPOSITORY).toBe('UserRepository');
    expect(new UserNameVO('alice').value).toBe('alice');
    expect(
      new RegisterHostCommand({
        firstName: 'A',
        lastName: 'B',
        email: 'a@b.c',
        phoneNumber: '+33600000000',
      }),
    ).toBeInstanceOf(RegisterHostCommand);
  });
});
