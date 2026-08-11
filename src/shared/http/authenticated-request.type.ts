import type { JwtPayload } from '../../modules/authentication/contracts';

export type AuthenticatedRequest = {
  user: JwtPayload;
};
