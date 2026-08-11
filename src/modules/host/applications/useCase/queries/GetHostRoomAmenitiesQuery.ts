import type { JwtPayload } from '../../../../authentication/contracts';

export class GetHostRoomAmenitiesQuery {
  constructor(
    public readonly authUser: JwtPayload,
    public readonly propertyId: number,
    public readonly roomId: number,
  ) {}
}
