import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { AddFavoriteCommandHandler } from './AddFavoriteCommandHandler';
import { AddFavoriteCommand } from '../commands/AddFavoriteCommand';
import {
  createFavoriteRepositoryMock,
  createResolveFavoriteUserServiceMock,
  createSampleFavorite,
} from '../favorite-test.helpers';
import { Room } from '../../../../rooms/domain/entities/room.entity';
import { Property } from '../../../../properties/domain/entities/property.entity';
import { ResolveFavoriteUserService } from '../../services/resolve-favorite-user.service';

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

describe('AddFavoriteCommandHandler', () => {
  const favoriteRepository = createFavoriteRepositoryMock();
  const resolveFavoriteUserService = createResolveFavoriteUserServiceMock();
  const roomRepository = { findById: vi.fn() };
  const roomMediaPresenter = { toOutput: vi.fn() };
  let handler: AddFavoriteCommandHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    resolveFavoriteUserService.resolveUserId.mockResolvedValue(9);
    roomRepository.findById.mockResolvedValue(createSampleRoom());
    favoriteRepository.findByUserAndRoom.mockResolvedValue(null);
    favoriteRepository.create.mockResolvedValue(createSampleFavorite());
    roomMediaPresenter.toOutput.mockResolvedValue({ id: 10, name: 'Suite' });
    handler = new AddFavoriteCommandHandler(
      favoriteRepository,
      roomRepository as never,
      roomMediaPresenter,
      resolveFavoriteUserService as unknown as ResolveFavoriteUserService,
    );
  });

  it('ajoute un favori', async () => {
    const result = await handler.execute(
      new AddFavoriteCommand(1, { roomId: 10 }),
    );

    expect(favoriteRepository.create).toHaveBeenCalled();
    expect(result.roomId).toBe(10);
  });

  it('refuse si utilisateur introuvable', async () => {
    resolveFavoriteUserService.resolveUserId.mockRejectedValue(
      new ForbiddenException('Accès refusé.'),
    );

    await expect(
      handler.execute(new AddFavoriteCommand(1, { roomId: 10 })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('refuse si chambre introuvable', async () => {
    roomRepository.findById.mockResolvedValue(null);

    await expect(
      handler.execute(new AddFavoriteCommand(1, { roomId: 10 })),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('refuse les doublons', async () => {
    favoriteRepository.findByUserAndRoom.mockResolvedValue(
      createSampleFavorite(),
    );

    await expect(
      handler.execute(new AddFavoriteCommand(1, { roomId: 10 })),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
