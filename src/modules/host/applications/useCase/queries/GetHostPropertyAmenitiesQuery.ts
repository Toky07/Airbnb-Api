import type { JwtPayload } from '../../../../authentication/domain/types/jwt-payload';

export class GetHostPropertyAmenitiesQuery {
  constructor(
    public readonly authUser: JwtPayload,
    public readonly propertyId: number,
  ) {}
}
