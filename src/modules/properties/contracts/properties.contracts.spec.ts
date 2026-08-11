import { describe, expect, it } from 'vitest';
import {
  CreatePropertyCommand,
  PROPERTY_REPOSITORY,
  PROPERTY_TYPE_REPOSITORY,
} from './index';

describe('properties/contracts', () => {
  it('expose tokens et commands publics', () => {
    expect(PROPERTY_REPOSITORY).toBe('PROPERTY_REPOSITORY');
    expect(PROPERTY_TYPE_REPOSITORY).toBe('PROPERTY_TYPE_REPOSITORY');
    expect(
      new CreatePropertyCommand({
        name: 'A',
        description: 'B',
        address: 'C',
        city: 'D',
        country: 'E',
        latitude: 1,
        longitude: 2,
        checkInTime: '15:00',
        checkOutTime: '11:00',
        ownerId: 1,
      }),
    ).toBeInstanceOf(CreatePropertyCommand);
  });
});
