import { describe, expect, it, vi } from 'vitest';
import { ResolveHostPropertyIdsService } from './resolve-host-property-ids.service';

describe('ResolveHostPropertyIdsService', () => {
  it('retourne les établissements du user lié à authId', async () => {
    const userRepository = {
      findByAuthId: vi.fn().mockResolvedValue({ id: 5 }),
    };
    const propertyRepository = {
      findAllByOwnerId: vi.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]),
    };

    const service = new ResolveHostPropertyIdsService(
      userRepository as never,
      propertyRepository as never,
    );

    await expect(service.resolve(99)).resolves.toEqual([1, 2]);
    expect(propertyRepository.findAllByOwnerId).toHaveBeenCalledWith(5);
  });

  it('filtre sur un établissement autorisé', async () => {
    const service = new ResolveHostPropertyIdsService(
      {
        findByAuthId: vi.fn().mockResolvedValue({ id: 5 }),
      } as never,
      {
        findAllByOwnerId: vi.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]),
      } as never,
    );

    await expect(service.resolve(99, 2)).resolves.toEqual([2]);
    await expect(service.resolve(99, 9)).resolves.toEqual([]);
  });
});
