import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { ResolveAuthenticatedUserService } from './resolve-authenticated-user.service';
import type { IUserRepository } from '../../modules/user/contracts';

describe('ResolveAuthenticatedUserService', () => {
  it('returns user when auth account is linked', async () => {
    const user = { id: 42 };
    const userRepository = {
      findByAuthId: vi.fn().mockResolvedValue(user),
    } as unknown as IUserRepository;

    const service = new ResolveAuthenticatedUserService(userRepository);

    await expect(service.resolveUser(7)).resolves.toBe(user);
    expect(userRepository.findByAuthId).toHaveBeenCalledWith(7);
  });

  it('returns user id when requested', async () => {
    const userRepository = {
      findByAuthId: vi.fn().mockResolvedValue({ id: 42 }),
    } as unknown as IUserRepository;

    const service = new ResolveAuthenticatedUserService(userRepository);

    await expect(service.resolveUserId(7)).resolves.toBe(42);
  });

  it('throws ForbiddenException by default when profile is missing', async () => {
    const userRepository = {
      findByAuthId: vi.fn().mockResolvedValue(null),
    } as unknown as IUserRepository;

    const service = new ResolveAuthenticatedUserService(userRepository);

    await expect(service.resolveUser(7)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('throws NotFoundException when configured', async () => {
    const userRepository = {
      findByAuthId: vi.fn().mockResolvedValue(undefined),
    } as unknown as IUserRepository;

    const service = new ResolveAuthenticatedUserService(userRepository);

    await expect(
      service.resolveUser(7, {
        failure: 'not-found',
        message: 'Utilisateur introuvable.',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
