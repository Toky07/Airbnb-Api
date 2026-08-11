import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HOST_ROLE_SLUG } from '@src/modules/authentication/domain/constants/permissions.constant';
import { EnsurePropertyOwnerHostRoleService } from './ensure-property-owner-host-role.service';

describe('EnsurePropertyOwnerHostRoleService', () => {
  const authRepository = { findById: vi.fn() };
  const userRepository = { findById: vi.fn() };
  const ensureAuthHasRole = { execute: vi.fn() };

  let service: EnsurePropertyOwnerHostRoleService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new EnsurePropertyOwnerHostRoleService(
      authRepository as never,
      userRepository as never,
      ensureAuthHasRole as never,
    );
  });

  it('retourne false si le user n’a pas d’authId', async () => {
    userRepository.findById.mockResolvedValue({ id: 5, authId: null });

    await expect(service.executeForOwnerUserId(5)).resolves.toBe(false);
    expect(ensureAuthHasRole.execute).not.toHaveBeenCalled();
  });

  it('délègue HOST_ROLE_SLUG pour un auth existant', async () => {
    authRepository.findById.mockResolvedValue({ id: 7 });
    ensureAuthHasRole.execute.mockResolvedValue(true);

    await expect(service.executeForAuthId(7)).resolves.toBe(true);
    expect(ensureAuthHasRole.execute).toHaveBeenCalledWith(7, HOST_ROLE_SLUG);
  });

  it('retourne false si l’auth est introuvable', async () => {
    authRepository.findById.mockResolvedValue(null);

    await expect(service.executeForAuthId(99)).resolves.toBe(false);
    expect(ensureAuthHasRole.execute).not.toHaveBeenCalled();
  });

  it('résout authId depuis le propriétaire puis délègue', async () => {
    userRepository.findById.mockResolvedValue({ id: 5, authId: 7 });
    authRepository.findById.mockResolvedValue({ id: 7 });
    ensureAuthHasRole.execute.mockResolvedValue(false);

    await expect(service.executeForOwnerUserId(5)).resolves.toBe(false);
    expect(authRepository.findById).toHaveBeenCalledWith(7);
    expect(ensureAuthHasRole.execute).toHaveBeenCalledWith(7, HOST_ROLE_SLUG);
  });
});
