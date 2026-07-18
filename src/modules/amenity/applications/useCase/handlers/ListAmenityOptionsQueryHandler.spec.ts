import { AMENITY_SCOPE } from '../../../domain/constants/amenity-scope.constant';
import { Amenity } from '../../../domain/entities/amenity.entity';
import { ListAmenityOptionsQueryHandler } from './ListAmenityOptionsQueryHandler';
import { ListAmenityOptionsQuery } from '../queries/ListAmenityOptionsQuery';

describe('ListAmenityOptionsQueryHandler', () => {
  it('lists active amenities for a scope', async () => {
    const repository = {
      findActive: async () => [
        new Amenity('WiFi', 'wifi', AMENITY_SCOPE.ROOM, true, 1),
      ],
    };

    const handler = new ListAmenityOptionsQueryHandler(repository as never);
    const result = await handler.execute(
      new ListAmenityOptionsQuery(AMENITY_SCOPE.ROOM),
    );

    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe('WiFi');
  });
});
