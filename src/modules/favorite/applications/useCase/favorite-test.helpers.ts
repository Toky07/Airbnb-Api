import { vi } from 'vitest';
import { Favorite } from '../../domain/entities/favorite.entity';

export function createSampleFavorite(
  overrides: Partial<{
    id: number;
    userId: number;
    roomId: number;
    createdAt: Date;
  }> = {},
): Favorite {
  return new Favorite(
    overrides.id ?? 1,
    overrides.userId ?? 9,
    overrides.roomId ?? 10,
    overrides.createdAt ?? new Date('2026-07-01T10:00:00.000Z'),
  );
}

export function createFavoriteRepositoryMock() {
  return {
    create: vi.fn(),
    deleteByUserAndRoom: vi.fn(),
    findByUserId: vi.fn(),
    findByUserAndRoom: vi.fn(),
    findFavoritedRoomIds: vi.fn(),
  };
}

export function createResolveAuthenticatedUserServiceMock(userId = 9) {
  return {
    resolveUserId: vi.fn().mockResolvedValue(userId),
  };
}
