import type { JwtPayload } from '../../../../authentication/domain/types/jwt-payload';

export class GetHostProfileQuery {
  constructor(public readonly authUser: JwtPayload) {}
}
