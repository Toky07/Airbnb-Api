import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { ResolveHostPropertyService } from './resolve-host-property.service';

describe('ResolveHostPropertyService', () => {
  const resolveHostUser = {
    resolve: vi.fn().mockResolvedValue({ id: 5 }),
  };
  const propertyRepository = {
    findAllByOwnerId: vi.fn().mockResolvedValue([{ id: 1 }]),
    findByIdForOwner: vi.fn().mockResolvedValue({ id: 1, name: 'Hôtel' }),
  };

  const service = new ResolveHostPropertyService(
    resolveHostUser as never,
    propertyRepository as never,
  );

  it('liste les établissements possédés', async () => {
    const properties = await service.listOwned({ sub: 99 } as never);
    expect(properties).toHaveLength(1);
    expect(propertyRepository.findAllByOwnerId).toHaveBeenCalledWith(5);
  });

  it('refuse un établissement non possédé', async () => {
    propertyRepository.findByIdForOwner.mockResolvedValue(null);

    await expect(
      service.requireOwned({ sub: 99 } as never, 2),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
