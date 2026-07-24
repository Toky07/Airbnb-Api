import type { RoomOutput } from '../../../rooms/applications/dto/room.output';

export class FavoriteOutput {
  constructor(
    public readonly id: number,
    public readonly roomId: number,
    public readonly createdAt: Date,
    public readonly room: RoomOutput,
  ) {}
}
