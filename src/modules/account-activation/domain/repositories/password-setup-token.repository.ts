import type { Auth } from '../../../authentication/domain/entities/user.entity';

export type PasswordSetupTokenRecord = {
  id: number;
  authId: number;
  tokenHash: string;
  expiresAt: Date;
  consumedAt: Date | null;
  auth?: Auth | null;
};

export interface IPasswordSetupTokenRepository {
  create(
    authId: number,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<PasswordSetupTokenRecord>;
  findValidByHash(tokenHash: string): Promise<PasswordSetupTokenRecord | null>;
  consume(id: number): Promise<void>;
  invalidatePendingForAuth(authId: number): Promise<void>;
}

export const PASSWORD_SETUP_TOKEN_REPOSITORY =
  'PASSWORD_SETUP_TOKEN_REPOSITORY';
