import type { Auth } from '../entities/user.entity';

export type PasswordResetTokenRecord = {
  id: number;
  authId: number;
  tokenHash: string;
  expiresAt: Date;
  consumedAt: Date | null;
  auth: Auth | null;
};

export interface IPasswordResetTokenRepository {
  create(authId: number, tokenHash: string, expiresAt: Date): Promise<PasswordResetTokenRecord>;
  findValidByHash(tokenHash: string): Promise<PasswordResetTokenRecord | null>;
  consume(id: number): Promise<void>;
  invalidatePendingForAuth(authId: number): Promise<void>;
}

export const PASSWORD_RESET_TOKEN_REPOSITORY = 'PASSWORD_RESET_TOKEN_REPOSITORY';
