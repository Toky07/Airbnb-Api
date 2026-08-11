import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Auth } from '@src/modules/authentication/domain/entities/user.entity';
import { EmailVO } from '@src/shared/valueObject/email.vo';
import { User } from '@src/modules/user/contracts';
import { UserNameVO } from '@src/modules/user/contracts';
import { PhoneNumberVO } from '@src/shared/valueObject/phone.vo';
import { ValidatePasswordSetupTokenQueryHandler } from './ValidatePasswordSetupTokenQueryHandler';
import { ValidatePasswordSetupTokenQuery } from '@src/modules/authentication/applications/useCase/queries/ValidatePasswordSetupTokenQuery';

describe('ValidatePasswordSetupTokenQueryHandler', () => {
  const tokenRepository = { findValidByHash: vi.fn() };
  const userRepository = { findByAuthId: vi.fn() };
  const tokenService = { hash: vi.fn((value: string) => `hash:${value}`) };

  let handler: ValidatePasswordSetupTokenQueryHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    handler = new ValidatePasswordSetupTokenQueryHandler(
      tokenRepository as never,
      userRepository as never,
      tokenService as never,
    );
  });

  it('returns invalid for empty token', async () => {
    const result = await handler.execute(
      new ValidatePasswordSetupTokenQuery('   '),
    );
    expect(result).toEqual({ valid: false });
  });

  it('returns invalid when token record is missing', async () => {
    tokenRepository.findValidByHash.mockResolvedValue(null);

    const result = await handler.execute(
      new ValidatePasswordSetupTokenQuery('token-abc'),
    );

    expect(tokenService.hash).toHaveBeenCalledWith('token-abc');
    expect(result).toEqual({ valid: false });
  });

  it('returns user details for valid token', async () => {
    tokenRepository.findValidByHash.mockResolvedValue({
      auth: new Auth(1, new EmailVO('jean@test.com'), null, [], 'pending'),
    });
    userRepository.findByAuthId.mockResolvedValue(
      new User(
        new UserNameVO('Jean'),
        new UserNameVO('Dupont'),
        new EmailVO('jean@test.com'),
        new PhoneNumberVO('+33601020304'),
        null,
        5,
      ),
    );

    const result = await handler.execute(
      new ValidatePasswordSetupTokenQuery('token-abc'),
    );

    expect(result).toEqual({
      valid: true,
      email: 'jean@test.com',
      firstName: 'Jean',
      lastName: 'Dupont',
    });
  });
});
