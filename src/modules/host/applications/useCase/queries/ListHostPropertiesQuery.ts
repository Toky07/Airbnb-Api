import type { JwtPayload } from '../../../../authentication/contracts';

export class ListHostPropertiesQuery {
  constructor(public readonly authUser: JwtPayload) {}
}
