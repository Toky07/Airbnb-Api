import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildPaginationMeta } from '../../../../../shared/pagination/pagination.types';
import { ListHostRoomsQueryHandler } from './ListHostRoomsQueryHandler';
import { ListHostRoomsQuery } from '../queries/ListHostRoomsQuery';
import { ListRoomsQuery } from '../../../../rooms/applications/useCase/queries/ListRoomsQuery';
import { authUser, createResolveHostPropertyMock } from './host-test.helpers';

const mockQueryExecute = vi.fn();

vi.mock('../../../../../shared/useCase/bus/query-bus', () => ({
  QueryBus: { execute: (...args: unknown[]) => mockQueryExecute(...args) },
}));

describe('ListHostRoomsQueryHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryExecute.mockResolvedValue({
      data: [{ id: 7, name: 'Suite' }],
      meta: buildPaginationMeta(1, 1, 10),
    });
  });

  it('délègue la liste des chambres au bus rooms', async () => {
    const resolveHostProperty = createResolveHostPropertyMock();
    const handler = new ListHostRoomsQueryHandler(resolveHostProperty as never);

    const result = await handler.execute(
      new ListHostRoomsQuery(authUser, 1, { page: 1, limit: 10 }),
    );

    expect(resolveHostProperty.requireOwned).toHaveBeenCalledWith(authUser, 1);
    expect(mockQueryExecute).toHaveBeenCalledWith(
      new ListRoomsQuery({ page: 1, limit: 10, propertyId: 1 }),
    );
    expect(result.data[0]?.id).toBe(7);
  });
});
