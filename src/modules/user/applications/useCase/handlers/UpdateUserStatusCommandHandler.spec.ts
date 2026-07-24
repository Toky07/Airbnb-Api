import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { UpdateUserStatusCommandHandler } from './UpdateUserStatusCommandHandler';
import { UpdateUserStatusCommand } from '../commands/UpdateUserStatusCommand';
import { ACCOUNT_STATUS } from '../../../../authentication/domain/constants/account-status.constant';

describe('UpdateUserStatusCommandHandler', () => {
  const userRepository = {
    findById: vi.fn(),
    updateStatus: vi.fn(),
  };
  const authRepository = {
    findById: vi.fn(),
    updateStatus: vi.fn(),
  };
  const ensureUserAuthAccount = {
    execute: vi.fn(),
  };

  let handler: UpdateUserStatusCommandHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    ensureUserAuthAccount.execute.mockResolvedValue({ userId: 1, authId: 5 });
    authRepository.findById.mockResolvedValue({
      id: 5,
      password: 'hash',
      status: ACCOUNT_STATUS.ACTIVE,
    });
    userRepository.findById.mockResolvedValue({
      id: 1,
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean@test.com',
      phoneNumber: '+33601020304',
      avatar: '',
      roles: [],
      authLinked: true,
      status: ACCOUNT_STATUS.ACTIVE,
      _createdAt: new Date(),
      _updatedAt: new Date(),
    });
    handler = new UpdateUserStatusCommandHandler(
      userRepository as never,
      authRepository as never,
      ensureUserAuthAccount as never,
    );
  });

  it('désactive un compte actif', async () => {
    await handler.execute(
      new UpdateUserStatusCommand(1, ACCOUNT_STATUS.DISABLED),
    );

    expect(authRepository.updateStatus).toHaveBeenCalledWith(
      5,
      ACCOUNT_STATUS.DISABLED,
    );
    expect(userRepository.updateStatus).toHaveBeenCalledWith(
      1,
      ACCOUNT_STATUS.DISABLED,
    );
  });

  it('réactive un compte désactivé', async () => {
    authRepository.findById.mockResolvedValue({
      id: 5,
      password: 'hash',
      status: ACCOUNT_STATUS.DISABLED,
    });

    await handler.execute(
      new UpdateUserStatusCommand(1, ACCOUNT_STATUS.ACTIVE),
    );

    expect(authRepository.updateStatus).toHaveBeenCalledWith(
      5,
      ACCOUNT_STATUS.ACTIVE,
    );
  });

  it('refuse l’activation sans mot de passe', async () => {
    authRepository.findById.mockResolvedValue({
      id: 5,
      password: null,
      status: ACCOUNT_STATUS.PENDING,
    });

    await expect(
      handler.execute(new UpdateUserStatusCommand(1, ACCOUNT_STATUS.ACTIVE)),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
