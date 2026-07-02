export class PasswordSetupLinkBuilder {
  build(rawToken: string): string {
    const baseUrl = (process.env.APP_PUBLIC_URL ?? 'http://localhost:5173').replace(
      /\/$/,
      '',
    );
    return `${baseUrl}/set-password?token=${encodeURIComponent(rawToken)}`;
  }
}
