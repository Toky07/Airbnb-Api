import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ResetPasswordWithTokenCommandHandler } from './ResetPasswordWithTokenCommandHandler';
import { ResetPasswordWithTokenCommand } from '../commands/ResetPasswordWithTokenCommand';
import { Auth } from '../../../domain/entities/user.entity';
import { EmailVO } from '../../../../../shared/valueObject/email.vo';

describe('ResetPasswordWithTokenCommandHandler', () => {
  const authRepository = { updatePassword: vi.fn() };
  const resetTokenRepository = {
    findValidByHash: vi.fn(),
    consume: vi.fn(),
  };
  const tokenService = {
    hash: vi.fn((value: string) => `hash:${value}`),
  };

  let handler: ResetPasswordWithTokenCommandHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    handler = new ResetPasswordWithTokenCommandHandler(
      authRepository as never,
      resetTokenRepository as never,
      tokenService as never,
    );
  });

  it('met à jour le mot de passe avec un token valide', async () => {
    resetTokenRepository.findValidByHash.mockResolvedValue({
      id: 3,
      authId: 1,
      tokenHash: 'hash:token-abc',
      expiresAt: new Date(Date.now() + 3600_000),
      consumedAt: null,
      auth: new Auth(1, new EmailVO('user@test.com'), 'old-hash', [], 'active'),
    });

    await handler.execute(
      new ResetPasswordWithTokenCommand('token-abc', 'secret12'),
    );

    expect(authRepository.updatePassword).toHaveBeenCalledWith(
      1,
      expect.any(String),
    );
    expect(resetTokenRepository.consume).toHaveBeenCalledWith(3);
  });
});
