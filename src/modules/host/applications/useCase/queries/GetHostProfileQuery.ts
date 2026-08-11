import type { JwtPayload } from '@src/modules/authentication/contracts';

export class GetHostProfileQuery {
  constructor(public readonly authUser: JwtPayload) {}
}
