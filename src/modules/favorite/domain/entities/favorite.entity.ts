export class Favorite {
  constructor(
    public readonly id: number | undefined,
    public readonly userId: number,
    public readonly roomId: number,
    public readonly createdAt: Date | undefined,
  ) {}
}
