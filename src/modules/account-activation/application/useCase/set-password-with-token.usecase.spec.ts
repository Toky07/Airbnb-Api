import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SetPasswordWithTokenUseCase } from './set-password-with-token.usecase';
import { Auth } from '../../../authentication/domain/entities/user.entity';
import { EmailVO } from '../../../../shared/valueObject/email.vo';
import { User } from '../../../user/domain/entities/user.entity';
import { UserNameVO } from '../../../user/domain/valueObject/username.vo';
import { PhoneNumberVO } from '../../../../shared/valueObject/phone.vo';

describe('SetPasswordWithTokenUseCase', () => {
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

  let useCase: SetPasswordWithTokenUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new SetPasswordWithTokenUseCase(
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

    await useCase.execute('token-abc', 'secret12');

    expect(authRepository.activateWithPassword).toHaveBeenCalledWith(
      1,
      expect.any(String),
    );
    expect(tokenRepository.consume).toHaveBeenCalledWith(10);
    expect(userRepository.updateStatus).toHaveBeenCalledWith(5, 'active');
  });
});
