import { ForbiddenException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AssertHostRoomOwnershipService } from './assert-host-room-ownership.service';
import { QueryBus } from '../../../../shared/useCase/bus/query-bus';
import { FindRoomQuery } from '../../../rooms/applications/useCase/queries/FindRoomQuery';
import type { ResolveHostPropertyService } from './resolve-host-property.service';
import type { JwtPayload } from '../../../authentication/domain/types/jwt-payload';

describe('AssertHostRoomOwnershipService', () => {
  const authUser = { sub: 1 } as JwtPayload;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('passes when room belongs to owned property', async () => {
    const resolveHostProperty = {
      requireOwned: vi.fn().mockResolvedValue({ id: 10 }),
    } as unknown as ResolveHostPropertyService;

    vi.spyOn(QueryBus, 'execute').mockResolvedValue({
      property: { id: 10 },
    });

    const service = new AssertHostRoomOwnershipService(resolveHostProperty);

    await expect(service.assert(authUser, 10, 5)).resolves.toBeUndefined();
    expect(resolveHostProperty.requireOwned).toHaveBeenCalledWith(authUser, 10);
    expect(QueryBus.execute).toHaveBeenCalledWith(new FindRoomQuery({ id: 5 }));
  });

  it('throws when room is missing or belongs to another property', async () => {
    const resolveHostProperty = {
      requireOwned: vi.fn().mockResolvedValue({ id: 10 }),
    } as unknown as ResolveHostPropertyService;

    vi.spyOn(QueryBus, 'execute').mockResolvedValue({
      property: { id: 99 },
    });

    const service = new AssertHostRoomOwnershipService(resolveHostProperty);

    await expect(service.assert(authUser, 10, 5)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
