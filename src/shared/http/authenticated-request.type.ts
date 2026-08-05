import type { JwtPayload } from '../../modules/authentication/domain/types/jwt-payload';

export type AuthenticatedRequest = {
  user: JwtPayload;
};
