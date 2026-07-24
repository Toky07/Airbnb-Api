import { PASSWORD_RESET_TOKEN_TTL_HOURS } from '../../domain/constants/account-status.constant';

export class PasswordResetLinkBuilder {
  build(rawToken: string): string {
    const baseUrl = (
      process.env.APP_PUBLIC_URL ?? 'http://localhost:5173'
    ).replace(/\/$/, '');
    return `${baseUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;
  }
}

export { PASSWORD_RESET_TOKEN_TTL_HOURS };
