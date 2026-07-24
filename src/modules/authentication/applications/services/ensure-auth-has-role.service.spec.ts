import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EnsureAuthHasRoleService } from './ensure-auth-has-role.service';
import { HOST_ROLE_SLUG } from '../../domain/constants/permissions.constant';
import { TRAVELER_ROLE_SLUG } from '../../domain/constants/system-roles.constant';

describe('EnsureAuthHasRoleService', () => {
  const authRepository = {
    findById: vi.fn(),
    assignRoles: vi.fn(),
  };
  const roleRepository = {
    findBySlug: vi.fn(),
  };

  let service: EnsureAuthHasRoleService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new EnsureAuthHasRoleService(
      authRepository as never,
      roleRepository as never,
    );
  });

  it('assigns the role while keeping existing ones', async () => {
    authRepository.findById.mockResolvedValue({
      id: 7,
      roles: [{ id: 1, slug: TRAVELER_ROLE_SLUG }],
    });
    roleRepository.findBySlug.mockResolvedValue({ id: 2, slug: HOST_ROLE_SLUG });
    authRepository.assignRoles.mockResolvedValue(true);

    const added = await service.execute(7, HOST_ROLE_SLUG);

    expect(added).toBe(true);
    expect(authRepository.assignRoles).toHaveBeenCalledWith(7, [1, 2]);
  });

  it('is idempotent when the role is already present', async () => {
    authRepository.findById.mockResolvedValue({
      id: 7,
      roles: [{ id: 2, slug: HOST_ROLE_SLUG }],
    });

    const added = await service.execute(7, HOST_ROLE_SLUG);

    expect(added).toBe(false);
    expect(roleRepository.findBySlug).not.toHaveBeenCalled();
    expect(authRepository.assignRoles).not.toHaveBeenCalled();
  });

  it('returns false when auth or role is missing', async () => {
    authRepository.findById.mockResolvedValue(null);
    expect(await service.execute(99, HOST_ROLE_SLUG)).toBe(false);

    authRepository.findById.mockResolvedValue({ id: 7, roles: [] });
    roleRepository.findBySlug.mockResolvedValue(null);
    expect(await service.execute(7, HOST_ROLE_SLUG)).toBe(false);
  });
});
