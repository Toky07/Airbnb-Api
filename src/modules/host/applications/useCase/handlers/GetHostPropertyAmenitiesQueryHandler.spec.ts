import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GetHostPropertyAmenitiesQueryHandler } from './GetHostPropertyAmenitiesQueryHandler';
import { GetHostPropertyAmenitiesQuery } from '@src/modules/host/applications/useCase/queries/GetHostPropertyAmenitiesQuery';
import { ListPropertyAmenitiesQuery } from '@src/modules/amenity/contracts';
import { authUser, createResolveHostPropertyMock } from './host-test.helpers';

const mockQueryExecute = vi.fn();

vi.mock('../../../../../shared/useCase/bus/query-bus', () => ({
  QueryBus: { execute: (...args: unknown[]) => mockQueryExecute(...args) },
}));

describe('GetHostPropertyAmenitiesQueryHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryExecute.mockResolvedValue([{ id: 1, name: 'Piscine' }]);
  });

  it('retourne les équipements d’un établissement possédé', async () => {
    const resolveHostProperty = createResolveHostPropertyMock();
    const handler = new GetHostPropertyAmenitiesQueryHandler(
      resolveHostProperty as never,
    );

    const result = await handler.execute(
      new GetHostPropertyAmenitiesQuery(authUser, 1),
    );

    expect(resolveHostProperty.requireOwned).toHaveBeenCalledWith(authUser, 1);
    expect(mockQueryExecute).toHaveBeenCalledWith(
      new ListPropertyAmenitiesQuery(1),
    );
    expect(result).toEqual([{ id: 1, name: 'Piscine' }]);
  });
});
