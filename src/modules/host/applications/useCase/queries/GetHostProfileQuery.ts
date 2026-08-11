import type { JwtPayload } from '../../../../authentication/contracts';

export class GetHostProfileQuery {
  constructor(public readonly authUser: JwtPayload) {}
}
