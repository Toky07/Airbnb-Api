import type { JwtPayload } from '@src/modules/authentication/contracts';

export type AuthenticatedRequest = {
  user: JwtPayload;
};
