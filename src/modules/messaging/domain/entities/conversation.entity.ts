export class Conversation {
  constructor(
    public readonly guestId: number,
    public readonly hostId: number,
    public readonly reservationId: number,
    public readonly id?: number,
    public lastMessageAt?: Date | null,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
