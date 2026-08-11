import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SetPasswordWithTokenCommandHandler } from './SetPasswordWithTokenCommandHandler';
import { SetPasswordWithTokenCommand } from '@src/modules/authentication/applications/useCase/commands/SetPasswordWithTokenCommand';
import { Auth } from '@src/modules/authentication/domain/entities/user.entity';
import { EmailVO } from '@src/shared/valueObject/email.vo';
import { User } from '@src/modules/user/contracts';
import { UserNameVO } from '@src/modules/user/contracts';
import { PhoneNumberVO } from '@src/shared/valueObject/phone.vo';

describe('SetPasswordWithTokenCommandHandler', () => {
  const authRepository = {
    activateWithPassword: vi.fn(),
  };
  const tokenRepository = {
    findValidByHash: vi.fn(),
    consume: vi.fn(),
  };
  const userRepository = {
    findByAuthId: vi.fn(),
    updateStatus: vi.fn(),
  };
  const tokenService = {
    hash: vi.fn((value: string) => `hash:${value}`),
  };

  let handler: SetPasswordWithTokenCommandHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    handler = new SetPasswordWithTokenCommandHandler(
      authRepository as never,
      tokenRepository as never,
      userRepository as never,
      tokenService as never,
    );
  });

  it('active le compte avec un token valide', async () => {
    tokenRepository.findValidByHash.mockResolvedValue({
      id: 10,
      authId: 1,
      tokenHash: 'hash:token-abc',
      expiresAt: new Date(Date.now() + 3600_000),
      consumedAt: null,
      auth: new Auth(1, new EmailVO('jean@test.com'), null, [], 'pending'),
    });
    userRepository.findByAuthId.mockResolvedValue(
      new User(
        new UserNameVO('Jean'),
        new UserNameVO('Dupont'),
        new EmailVO('jean@test.com'),
        new PhoneNumberVO('+33601020304'),
        '',
        5,
        undefined,
        undefined,
        1,
      ),
    );

    await handler.execute(
      new SetPasswordWithTokenCommand('token-abc', 'secret12'),
    );

    expect(authRepository.activateWithPassword).toHaveBeenCalledWith(
      1,
      expect.any(String),
    );
    expect(tokenRepository.consume).toHaveBeenCalledWith(10);
    expect(userRepository.updateStatus).toHaveBeenCalledWith(5, 'active');
  });
});
