import { UnauthorizedException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { ResolveReservationStatsScopeService } from './resolve-reservation-stats-scope.service';

describe('ResolveReservationStatsScopeService', () => {
  it('retourne un scope global pour canReadAll', async () => {
    const resolveHostPropertyIds = { resolve: vi.fn() };
    const service = new ResolveReservationStatsScopeService(
      resolveHostPropertyIds as never,
    );

    await expect(
      service.resolve(1, { canReadAll: true, canReadHost: false }),
    ).resolves.toEqual({});
    expect(resolveHostPropertyIds.resolve).not.toHaveBeenCalled();
  });

  it('retourne propertyIds pour un hôte avec établissements', async () => {
    const service = new ResolveReservationStatsScopeService({
      resolve: vi.fn().mockResolvedValue([1, 2]),
    } as never);

    await expect(
      service.resolve(9, { canReadAll: false, canReadHost: true }),
    ).resolves.toEqual({ propertyIds: [1, 2] });
  });

  it('retourne propertyId -1 quand l’hôte n’a aucun établissement', async () => {
    const service = new ResolveReservationStatsScopeService({
      resolve: vi.fn().mockResolvedValue([]),
    } as never);

    await expect(
      service.resolve(9, { canReadAll: false, canReadHost: true }),
    ).resolves.toEqual({ propertyId: -1 });
  });

  it('refuse l’accès sans droits', async () => {
    const service = new ResolveReservationStatsScopeService({
      resolve: vi.fn(),
    } as never);

    await expect(
      service.resolve(9, { canReadAll: false, canReadHost: false }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
