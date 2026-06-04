import { describe, expect, it } from 'vitest';
import { PasswordSetupTokenService } from './password-setup-token.service';

describe('PasswordSetupTokenService', () => {
  const service = new PasswordSetupTokenService();

  it('génère un token hashé cohérent', () => {
    const token = service.generate();
    expect(token.raw).toHaveLength(64);
    expect(service.hash(token.raw)).toBe(token.hash);
  });

  it('détecte un token expiré', () => {
    expect(service.isExpired(new Date(Date.now() - 1000))).toBe(true);
    expect(service.isExpired(new Date(Date.now() + 60_000))).toBe(false);
  });
});
