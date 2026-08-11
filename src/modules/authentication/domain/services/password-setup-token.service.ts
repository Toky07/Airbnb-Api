import { createHash, randomBytes } from 'crypto';
import { PASSWORD_SETUP_TOKEN_TTL_HOURS } from '@src/modules/authentication/domain/constants/account-status.constant';

export type PasswordSetupToken = {
  raw: string;
  hash: string;
  expiresAt: Date;
};

export class PasswordSetupTokenService {
  generate(): PasswordSetupToken {
    const raw = randomBytes(32).toString('hex');
    const hash = this.hash(raw);
    const expiresAt = new Date(
      Date.now() + PASSWORD_SETUP_TOKEN_TTL_HOURS * 60 * 60 * 1000,
    );

    return { raw, hash, expiresAt };
  }

  hash(rawToken: string): string {
    return createHash('sha256').update(rawToken.trim()).digest('hex');
  }

  isExpired(expiresAt: Date | null | undefined): boolean {
    if (!expiresAt) {
      return true;
    }
    return expiresAt.getTime() <= Date.now();
  }
}
