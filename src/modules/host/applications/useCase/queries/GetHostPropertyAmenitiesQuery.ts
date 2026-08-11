import type { JwtPayload } from '@src/modules/authentication/contracts';

export class GetHostPropertyAmenitiesQuery {
  constructor(
    public readonly authUser: JwtPayload,
    public readonly propertyId: number,
  ) {}
}
