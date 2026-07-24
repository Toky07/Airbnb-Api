import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ForbiddenException } from '@nestjs/common';
import { ListMyFavoritesQueryHandler } from './ListMyFavoritesQueryHandler';
import { ListMyFavoritesQuery } from '../queries/ListMyFavoritesQuery';
import {
  createFavoriteRepositoryMock,
  createSampleFavorite,
} from '../favorite-test.helpers';
import { Room } from '../../../../rooms/domain/entities/room.entity';
import { Property } from '../../../../properties/domain/entities/property.entity';

function createSampleRoom() {
  return new Room({
    id: 10,
    name: 'Suite',
    slug: 'suite',
    description: 'Description',
    pricePerNight: 100,
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    beds: 1,
    quantity: 1,
    size: 30,
    status: 'available',
    property: new Property({
      id: 1,
      name: 'Hotel',
      description: '',
      address: '',
      city: 'Paris',
      country: 'France',
      latitude: 0,
      longitude: 0,
      checkInTime: '15:00',
      checkOutTime: '11:00',
      ownerId: 1,
    }),
  });
}

describe('ListMyFavoritesQueryHandler', () => {
  const favoriteRepository = createFavoriteRepositoryMock();
  const userRepository = { findByAuthId: vi.fn() };
  const roomRepository = { findById: vi.fn() };
  const roomMediaPresenter = { toOutput: vi.fn() };
  let handler: ListMyFavoritesQueryHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    userRepository.findByAuthId.mockResolvedValue({ id: 9 });
    favoriteRepository.findByUserId.mockResolvedValue([createSampleFavorite()]);
    roomRepository.findById.mockResolvedValue(createSampleRoom());
    roomMediaPresenter.toOutput.mockResolvedValue({ id: 10, name: 'Suite' });
    handler = new ListMyFavoritesQueryHandler(
      favoriteRepository as never,
      userRepository as never,
      roomRepository as never,
      roomMediaPresenter as never,
    );
  });

  it('liste les favoris de l’utilisateur', async () => {
    const result = await handler.execute(new ListMyFavoritesQuery(1));

    expect(result).toHaveLength(1);
    expect(result[0]?.roomId).toBe(10);
  });

  it('refuse si utilisateur introuvable', async () => {
    userRepository.findByAuthId.mockResolvedValue(null);

    await expect(handler.execute(new ListMyFavoritesQuery(1))).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
