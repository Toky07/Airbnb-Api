import type { JwtPayload } from '../../../../authentication/domain/types/jwt-payload';

export class DeleteHostRoomCommand {
  constructor(
    public readonly authUser: JwtPayload,
    public readonly propertyId: number,
    public readonly roomId: number,
  ) {}
}
