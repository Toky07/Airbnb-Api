import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SendAccountInvitationUseCase } from './send-account-invitation.usecase';
import { EmailVO } from '../../../../shared/valueObject/email.vo';
import { User } from '../../../user/domain/entities/user.entity';
import { UserNameVO } from '../../../user/domain/valueObject/username.vo';
import { PhoneNumberVO } from '../../../../shared/valueObject/phone.vo';
import { Auth } from '../../../authentication/domain/entities/user.entity';

describe('SendAccountInvitationUseCase', () => {
  const userRepository = {
    findById: vi.fn(),
    linkAuthAccount: vi.fn(),
    updateStatus: vi.fn(),
  };
  const authRepository = {
    findById: vi.fn(),
    findByEmail: vi.fn(),
    createPending: vi.fn(),
  };
  const tokenRepository = {
    create: vi.fn(),
  };
  const mailService = {
    sendSimple: vi.fn(),
  };
  const tokenService = {
    generate: vi.fn(() => ({
      raw: 'raw-token',
      hash: 'hash-token',
      expiresAt: new Date(Date.now() + 3600_000),
    })),
  };
  const linkBuilder = {
    build: vi.fn(() => 'http://localhost/set-password?token=raw-token'),
  };

  let useCase: SendAccountInvitationUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new SendAccountInvitationUseCase(
      userRepository as never,
      authRepository as never,
      tokenRepository as never,
      mailService as never,
      tokenService as never,
      linkBuilder as never,
    );
  });

  it('should send an invitation for a pending user', async () => {
    userRepository.findById.mockResolvedValue(
      new User(
        new UserNameVO('Jean'),
        new UserNameVO('Dupont'),
        new EmailVO('jean@test.com'),
        new PhoneNumberVO('+33601020304'),
        '',
        1,
        undefined,
        undefined,
        null,
      ),
    );
    authRepository.createPending.mockResolvedValue(
      new Auth(2, new EmailVO('jean@test.com'), null, [], 'pending'),
    );
    mailService.sendSimple.mockResolvedValue({});

    await useCase.execute({ userId: 1, sourceModule: 'admin-user-create' });

    expect(authRepository.createPending).toHaveBeenCalledWith('jean@test.com');
    expect(userRepository.linkAuthAccount).toHaveBeenCalledWith(1, 2);
    expect(tokenRepository.create).toHaveBeenCalledWith(
      2,
      'hash-token',
      expect.any(Date),
    );
    expect(mailService.sendSimple).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'jean@test.com',
        subject: 'Activate your account',
      }),
    );
  });
});
