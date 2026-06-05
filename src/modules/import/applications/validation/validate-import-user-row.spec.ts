import { describe, expect, it } from 'vitest';
import { validateImportUserRow } from './validate-import-user-row';

describe('validateImportUserRow', () => {
  it('valide un utilisateur', () => {
    expect(
      validateImportUserRow(
        {
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'jean@example.com',
          phoneNumber: '+33612345678',
        },
        0,
      ).ok,
    ).toBe(true);
  });

  it('rejette un e-mail invalide', () => {
    const result = validateImportUserRow(
      {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'invalid',
        phoneNumber: '+33612345678',
      },
      0,
    );

    expect(result.ok).toBe(false);
  });
});
