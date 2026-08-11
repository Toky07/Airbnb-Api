import type { JwtPayload } from '../../../../authentication/contracts';

export class GetHostPropertyAmenitiesQuery {
  constructor(
    public readonly authUser: JwtPayload,
    public readonly propertyId: number,
  ) {}
}
