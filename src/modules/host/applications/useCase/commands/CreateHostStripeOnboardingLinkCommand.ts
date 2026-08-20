import type { JwtPayload } from '@src/modules/authentication/contracts';

export class CreateHostStripeOnboardingLinkCommand {
  constructor(public readonly authUser: JwtPayload) {}
}
