import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { ResolveFavoriteUserService } from './resolve-favorite-user.service';
import type { IUserRepository } from '../../../user/domain/repositories/user.repository';

describe('ResolveFavoriteUserService', () => {
  it('returns user id when auth account is linked', async () => {
    const userRepository = {
      findByAuthId: vi.fn().mockResolvedValue({ id: 42 }),
    } as unknown as IUserRepository;

    const service = new ResolveFavoriteUserService(userRepository);

    await expect(service.resolveUserId(7)).resolves.toBe(42);
    expect(userRepository.findByAuthId).toHaveBeenCalledWith(7);
  });

  it('throws when user profile is missing', async () => {
    const userRepository = {
      findByAuthId: vi.fn().mockResolvedValue(null),
    } as unknown as IUserRepository;

    const service = new ResolveFavoriteUserService(userRepository);

    await expect(service.resolveUserId(7)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
