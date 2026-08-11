import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Auth } from '@src/modules/authentication/domain/entities/user.entity';
import { EmailVO } from '@src/shared/valueObject/email.vo';
import { User } from '@src/modules/user/contracts';
import { UserNameVO } from '@src/modules/user/contracts';
import { PhoneNumberVO } from '@src/shared/valueObject/phone.vo';
import { ValidatePasswordResetTokenQuery } from '@src/modules/authentication/applications/useCase/queries/ValidatePasswordResetTokenQuery';
import { ValidatePasswordResetTokenQueryHandler } from './ValidatePasswordResetTokenQueryHandler';

describe('ValidatePasswordResetTokenQueryHandler', () => {
  const resetTokenRepository = { findValidByHash: vi.fn() };
  const userRepository = { findByAuthId: vi.fn() };
  const tokenService = { hash: vi.fn((value: string) => `hash:${value}`) };

  let handler: ValidatePasswordResetTokenQueryHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    handler = new ValidatePasswordResetTokenQueryHandler(
      resetTokenRepository as never,
      userRepository as never,
      tokenService as never,
    );
  });

  it('rejette un token vide', async () => {
    await expect(
      handler.execute(new ValidatePasswordResetTokenQuery('   ')),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejette un token inconnu', async () => {
    resetTokenRepository.findValidByHash.mockResolvedValue(null);

    await expect(
      handler.execute(new ValidatePasswordResetTokenQuery('token-abc')),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(tokenService.hash).toHaveBeenCalledWith('token-abc');
  });

  it('retourne l’email du user quand il existe', async () => {
    resetTokenRepository.findValidByHash.mockResolvedValue({
      auth: new Auth(1, new EmailVO('auth@test.com'), null, [], 'active'),
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

    await expect(
      handler.execute(new ValidatePasswordResetTokenQuery('token-abc')),
    ).resolves.toEqual({ email: 'jean@test.com' });
  });

  it('retombe sur l’email auth si le user est absent', async () => {
    resetTokenRepository.findValidByHash.mockResolvedValue({
      auth: new Auth(1, new EmailVO('auth@test.com'), null, [], 'active'),
    });
    userRepository.findByAuthId.mockResolvedValue(null);

    await expect(
      handler.execute(new ValidatePasswordResetTokenQuery('token-abc')),
    ).resolves.toEqual({ email: 'auth@test.com' });
  });
});
