import type { JwtPayload } from '@src/modules/authentication/contracts';

export class ListHostRoomBlockedDatesQuery {
  constructor(
    public readonly authUser: JwtPayload,
    public readonly propertyId: number,
    public readonly roomId: number,
  ) {}
}
