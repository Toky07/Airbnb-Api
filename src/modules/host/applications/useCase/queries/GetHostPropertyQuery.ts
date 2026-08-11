import type { JwtPayload } from '../../../../authentication/contracts';

export class GetHostPropertyQuery {
  constructor(
    public readonly authUser: JwtPayload,
    public readonly propertyId: number,
  ) {}
}
