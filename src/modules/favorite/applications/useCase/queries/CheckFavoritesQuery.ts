export class CheckFavoritesQuery {
  constructor(
    public readonly authId: number,
    public readonly roomIds: number[],
  ) {}
}
