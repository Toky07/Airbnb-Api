import { BadRequestException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RegisterHostCommandHandler } from './RegisterHostCommandHandler';
import { RegisterHostCommand } from '../commands/RegisterHostCommand';
import { commandBusExecuteMock } from '../../../../../test/command-bus.mock';
import { TRAVELER_ROLE_SLUG } from '../../../../authentication/contracts';

describe('RegisterHostCommandHandler', () => {
  const authRepository = {
    findByEmail: vi.fn(),
    createPending: vi.fn(),
    assignRoles: vi.fn(),
  };
  const roleRepository = { findBySlug: vi.fn() };
  const userRepository = {
    create: vi.fn(),
    linkAuthAccount: vi.fn(),
  };

  let handler: RegisterHostCommandHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    authRepository.findByEmail.mockResolvedValue(null);
    authRepository.createPending.mockResolvedValue({ id: 10 });
    roleRepository.findBySlug.mockResolvedValue({ id: 3 });
    userRepository.create.mockResolvedValue({ id: 5 });
    handler = new RegisterHostCommandHandler(
      authRepository as never,
      roleRepository as never,
      userRepository as never,
    );
  });

  it('crée un voyageur et envoie l’invitation', async () => {
    const result = await handler.execute(
      new RegisterHostCommand({
        email: 'guest@test.com',
        firstName: 'Jean',
        lastName: 'Dupont',
        phoneNumber: '+33601020304',
      }),
    );

    expect(result).toBe(true);
    expect(userRepository.linkAuthAccount).toHaveBeenCalledWith(5, 10);
    expect(roleRepository.findBySlug).toHaveBeenCalledWith(TRAVELER_ROLE_SLUG);
    expect(authRepository.assignRoles).toHaveBeenCalledWith(10, [3]);
    expect(commandBusExecuteMock).toHaveBeenCalled();
  });

  it('refuse un email déjà utilisé', async () => {
    authRepository.findByEmail.mockResolvedValue({ id: 1 });

    await expect(
      handler.execute(
        new RegisterHostCommand({
          email: 'guest@test.com',
          firstName: 'Jean',
          lastName: 'Dupont',
          phoneNumber: '+33601020304',
        }),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
