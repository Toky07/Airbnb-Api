import type { JwtPayload } from '@src/modules/authentication/contracts';

export class GetHostPropertyQuery {
  constructor(
    public readonly authUser: JwtPayload,
    public readonly propertyId: number,
  ) {}
}
