import { describe, expect, it } from 'vitest';
import { AMENITY_SCOPE } from '../../../domain/constants/amenity-scope.constant';
import { ListAmenitiesQueryHandler } from './ListAmenitiesQueryHandler';
import { ListAmenitiesQuery } from '../queries/ListAmenitiesQuery';

describe('ListAmenitiesQueryHandler', () => {
  it('liste les amenities par scope', async () => {
    const repository = {
      findAll: async () => [
        {
          id: 1,
          name: 'WiFi',
          icon: 'wifi',
          scope: AMENITY_SCOPE.ROOM,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    };

    const handler = new ListAmenitiesQueryHandler(repository as never);
    const result = await handler.execute(
      new ListAmenitiesQuery(AMENITY_SCOPE.ROOM),
    );

    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe('WiFi');
  });
});
