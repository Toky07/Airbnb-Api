import { describe, expect, it } from 'vitest';
import {
  AMENITY_SCOPE,
  ListAmenityOptionsQuery,
  ListPropertyAmenitiesQuery,
  ListRoomAmenitiesQuery,
  SyncPropertyAmenitiesCommand,
  SyncRoomAmenitiesCommand,
} from './index';

describe('amenity/contracts', () => {
  it('expose scopes, queries et commands publics', () => {
    expect(AMENITY_SCOPE.ROOM).toBe('room');
    expect(AMENITY_SCOPE.PROPERTY).toBe('property');
    expect(new ListAmenityOptionsQuery(AMENITY_SCOPE.ROOM)).toBeInstanceOf(
      ListAmenityOptionsQuery,
    );
    expect(new ListPropertyAmenitiesQuery(1)).toBeInstanceOf(
      ListPropertyAmenitiesQuery,
    );
    expect(new ListRoomAmenitiesQuery(2)).toBeInstanceOf(
      ListRoomAmenitiesQuery,
    );
    expect(
      new SyncPropertyAmenitiesCommand(1, { amenityIds: [1] }),
    ).toBeInstanceOf(SyncPropertyAmenitiesCommand);
    expect(new SyncRoomAmenitiesCommand(2, { amenityIds: [1] })).toBeInstanceOf(
      SyncRoomAmenitiesCommand,
    );
  });
});
