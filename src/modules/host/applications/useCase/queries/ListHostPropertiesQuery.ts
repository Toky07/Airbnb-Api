import type { JwtPayload } from '@src/modules/authentication/contracts';

export class ListHostPropertiesQuery {
  constructor(public readonly authUser: JwtPayload) {}
}
