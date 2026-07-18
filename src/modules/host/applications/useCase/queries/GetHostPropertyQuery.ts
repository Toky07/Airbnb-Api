import type { JwtPayload } from '../../../../authentication/domain/types/jwt-payload';

export class GetHostPropertyQuery {
  constructor(
    public readonly authUser: JwtPayload,
    public readonly propertyId: number,
  ) {}
}
