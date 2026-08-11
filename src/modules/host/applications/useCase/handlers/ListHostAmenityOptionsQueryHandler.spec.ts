import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AMENITY_SCOPE } from '../../../../amenity/contracts';
import { ListHostAmenityOptionsQueryHandler } from './ListHostAmenityOptionsQueryHandler';
import { ListHostAmenityOptionsQuery } from '../queries/ListHostAmenityOptionsQuery';
import { ListAmenityOptionsQuery } from '../../../../amenity/contracts';

const mockQueryExecute = vi.fn();

vi.mock('../../../../../shared/useCase/bus/query-bus', () => ({
  QueryBus: { execute: (...args: unknown[]) => mockQueryExecute(...args) },
}));

describe('ListHostAmenityOptionsQueryHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryExecute.mockResolvedValue([{ id: 1, name: 'WiFi' }]);
  });

  it('délègue la liste des options au bus amenity', async () => {
    const handler = new ListHostAmenityOptionsQueryHandler();

    const result = await handler.execute(
      new ListHostAmenityOptionsQuery(AMENITY_SCOPE.PROPERTY),
    );

    expect(mockQueryExecute).toHaveBeenCalledWith(
      new ListAmenityOptionsQuery(AMENITY_SCOPE.PROPERTY),
    );
    expect(result).toEqual([{ id: 1, name: 'WiFi' }]);
  });
});
