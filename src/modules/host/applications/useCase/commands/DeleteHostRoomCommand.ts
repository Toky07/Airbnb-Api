import type { JwtPayload } from '@src/modules/authentication/contracts';

export class DeleteHostRoomCommand {
  constructor(
    public readonly authUser: JwtPayload,
    public readonly propertyId: number,
    public readonly roomId: number,
  ) {}
}
