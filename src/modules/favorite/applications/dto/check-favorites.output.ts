export class CheckFavoritesOutput {
  constructor(public readonly favorites: Record<string, boolean>) {}

  static fromRoomIds(
    roomIds: number[],
    favoritedRoomIds: number[],
  ): CheckFavoritesOutput {
    const favorited = new Set(favoritedRoomIds);
    const favorites = Object.fromEntries(
      roomIds.map((roomId) => [String(roomId), favorited.has(roomId)]),
    );

    return new CheckFavoritesOutput(favorites);
  }
}
