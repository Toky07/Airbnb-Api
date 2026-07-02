import { describe, expect, it } from 'vitest';
import { PasswordSetupLinkBuilder } from '../../domain/services/password-setup-link.builder';

describe('PasswordSetupLinkBuilder', () => {
  it('construit un lien avec le token encodé', () => {
    process.env.APP_PUBLIC_URL = 'http://localhost:5173';
    const builder = new PasswordSetupLinkBuilder();
    const link = builder.build('abc+def');
    expect(link).toBe('http://localhost:5173/set-password?token=abc%2Bdef');
  });
});
