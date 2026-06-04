export class RoomType {
  constructor(
    public readonly name: string,
    public readonly slug: string,
    public readonly sortOrder: number,
    public readonly isActive: boolean,
    public readonly id?: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
