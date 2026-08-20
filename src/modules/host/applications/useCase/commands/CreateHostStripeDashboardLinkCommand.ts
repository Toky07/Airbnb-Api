import type { JwtPayload } from '@src/modules/authentication/contracts';

export class CreateHostStripeDashboardLinkCommand {
  constructor(public readonly authUser: JwtPayload) {}
}
