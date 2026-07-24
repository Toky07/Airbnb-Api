export class RemoveFavoriteCommand {
  constructor(
    public readonly authId: number,
    public readonly roomId: number,
  ) {}
}
