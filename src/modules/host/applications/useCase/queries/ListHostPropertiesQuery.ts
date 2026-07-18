import type { JwtPayload } from '../../../../authentication/domain/types/jwt-payload';

export class ListHostPropertiesQuery {
  constructor(public readonly authUser: JwtPayload) {}
}
