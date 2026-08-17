import { describe, expect, it, vi } from 'vitest';
import { ForbiddenException } from '@nestjs/common';
import { SUPERADMIN_ROLE_SLUG } from '@src/modules/authentication/domain/constants/permissions.constant';
import { assertCanAssignRoleIds } from './assert-can-assign-roles';

describe('assertCanAssignRoleIds', () => {
  it('allows non-superadmin roles for a regular admin', async () => {
    const roleRepository = {
      findById: vi.fn().mockResolvedValue({ slug: 'host' }),
    };

    await expect(
      assertCanAssignRoleIds(roleRepository as never, [2], false),
    ).resolves.toBeUndefined();
  });

  it('blocks superadmin assignment unless the actor is superadmin', async () => {
    const roleRepository = {
      findById: vi.fn().mockResolvedValue({ slug: SUPERADMIN_ROLE_SLUG }),
    };

    await expect(
      assertCanAssignRoleIds(roleRepository as never, [1], false),
    ).rejects.toBeInstanceOf(ForbiddenException);

    await expect(
      assertCanAssignRoleIds(roleRepository as never, [1], true),
    ).resolves.toBeUndefined();
  });
});
