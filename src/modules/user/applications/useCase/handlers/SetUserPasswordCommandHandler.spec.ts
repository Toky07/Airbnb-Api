import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SetUserPasswordCommandHandler } from './SetUserPasswordCommandHandler';
import { SetUserPasswordCommand } from '../commands/SetUserPasswordCommand';
import { ACCOUNT_STATUS } from '../../../../authentication/contracts';

vi.mock('bcrypt', () => ({
  hash: vi.fn(async (value: string) => `hash:${value}`),
}));

describe('SetUserPasswordCommandHandler', () => {
  const userRepository = {
    findById: vi.fn(),
    updateStatus: vi.fn(),
  };
  const authRepository = {
    findById: vi.fn(),
    updatePassword: vi.fn(),
    activateWithPassword: vi.fn(),
    updateStatus: vi.fn(),
  };
  const ensureUserAuthAccount = {
    execute: vi.fn(),
  };

  let handler: SetUserPasswordCommandHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    ensureUserAuthAccount.execute.mockResolvedValue({ userId: 1, authId: 5 });
    authRepository.findById.mockResolvedValue({ id: 5, password: null });
    userRepository.findById.mockResolvedValue({
      id: 1,
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean@test.com',
      phoneNumber: '+33601020304',
      avatar: '',
      roles: [],
      authLinked: true,
      status: ACCOUNT_STATUS.PENDING,
      _createdAt: new Date(),
      _updatedAt: new Date(),
    });
    handler = new SetUserPasswordCommandHandler(
      userRepository as never,
      authRepository as never,
      ensureUserAuthAccount as never,
    );
  });

  it('active un compte en attente lors de la première définition du mot de passe', async () => {
    await handler.execute(new SetUserPasswordCommand(1, 'secret12'));

    expect(authRepository.activateWithPassword).toHaveBeenCalledWith(
      5,
      'hash:secret12',
    );
    expect(userRepository.updateStatus).toHaveBeenCalledWith(
      1,
      ACCOUNT_STATUS.ACTIVE,
    );
  });

  it('met à jour le mot de passe d’un compte existant', async () => {
    authRepository.findById.mockResolvedValue({
      id: 5,
      password: 'existing',
      status: ACCOUNT_STATUS.ACTIVE,
    });

    await handler.execute(new SetUserPasswordCommand(1, 'newpass1'));

    expect(authRepository.updatePassword).toHaveBeenCalledWith(
      5,
      'hash:newpass1',
    );
    expect(authRepository.activateWithPassword).not.toHaveBeenCalled();
  });

  it('refuse un mot de passe trop court', async () => {
    await expect(
      handler.execute(new SetUserPasswordCommand(1, '123')),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('refuse si le compte auth est introuvable', async () => {
    authRepository.findById.mockResolvedValue(null);

    await expect(
      handler.execute(new SetUserPasswordCommand(1, 'secret12')),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
