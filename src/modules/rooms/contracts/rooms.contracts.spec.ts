import { describe, expect, it } from 'vitest';
import {
  CreateRoomCommand,
  ROOM_REPOSITORY,
  ROOM_TYPE_REPOSITORY,
  toRoomSummary,
} from './index';
import { toRoomSummary as leafToRoomSummary } from './room-summary';

describe('rooms/contracts', () => {
  it('expose tokens et commands publics', () => {
    expect(ROOM_REPOSITORY).toBe('ROOM_REPOSITORY');
    expect(ROOM_TYPE_REPOSITORY).toBe('ROOM_TYPE_REPOSITORY');
    expect(CreateRoomCommand).toBeTypeOf('function');
  });

  it('expose RoomSummary via contrat feuille (anti-cycle properties)', () => {
    const summary = leafToRoomSummary(
      {
        id: 1,
        name: 'Suite',
        slug: 'suite',
        description: 'Desc',
        pricePerNight: 100,
        maxGuests: 2,
        bedrooms: 1,
        bathrooms: 1,
        beds: 1,
        quantity: 1,
        size: 30,
        status: 'available',
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-02'),
      },
      ['img.jpg'],
    );
    expect(summary.id).toBe(1);
    expect(summary.images).toEqual(['img.jpg']);
    expect(summary).not.toHaveProperty('property');
    expect(toRoomSummary).toBe(leafToRoomSummary);
  });
});
