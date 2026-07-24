import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RequestPasswordResetCommandHandler } from './RequestPasswordResetCommandHandler';
import { RequestPasswordResetCommand } from '../commands/RequestPasswordResetCommand';
import { Auth } from '../../../domain/entities/user.entity';
import { EmailVO } from '../../../../../shared/valueObject/email.vo';

describe('RequestPasswordResetCommandHandler', () => {
  const authRepository = { findByEmail: vi.fn() };
  const resetTokenRepository = { create: vi.fn() };
  const mailService = { sendSimple: vi.fn() };
  const tokenService = {
    generate: vi.fn(() => ({
      raw: 'raw-token',
      hash: 'hash-token',
      expiresAt: new Date(Date.now() + 3600_000),
    })),
  };
  const linkBuilder = {
    build: vi.fn(() => 'http://localhost/reset-password?token=raw-token'),
  };

  let handler: RequestPasswordResetCommandHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    handler = new RequestPasswordResetCommandHandler(
      authRepository as never,
      resetTokenRepository as never,
      mailService as never,
      tokenService as never,
      linkBuilder,
    );
  });

  it('envoie un email pour un compte actif', async () => {
    authRepository.findByEmail.mockResolvedValue(
      new Auth(1, new EmailVO('user@test.com'), 'hash', [], 'active'),
    );

    await handler.execute(new RequestPasswordResetCommand('user@test.com'));

    expect(resetTokenRepository.create).toHaveBeenCalled();
    expect(mailService.sendSimple).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'user@test.com' }),
    );
  });

  it('ne révèle pas l’absence de compte', async () => {
    authRepository.findByEmail.mockResolvedValue(null);

    await handler.execute(new RequestPasswordResetCommand('unknown@test.com'));

    expect(resetTokenRepository.create).not.toHaveBeenCalled();
    expect(mailService.sendSimple).not.toHaveBeenCalled();
  });
});
