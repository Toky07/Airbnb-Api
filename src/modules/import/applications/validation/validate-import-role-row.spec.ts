import { describe, expect, it } from 'vitest';
import { parseImportRolePermissionKeys } from './parse-import-role-permission-keys';
import { validateImportRoleRow } from './validate-import-role-row';

describe('validateImportRoleRow', () => {
  it('valide un rôle avec permissions', () => {
    expect(
      validateImportRoleRow({
        name: 'Support',
        slug: 'support',
        permissionKeys: 'users.read;users.update',
      }).ok,
    ).toBe(true);
  });

  it('rejette une permission inconnue', () => {
    const result = validateImportRoleRow({
      name: 'Support',
      slug: 'support',
      permissionKeys: 'unknown.permission',
    });

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.field).toBe('permissionKeys');
  });

  it('rejette un slug invalide', () => {
    const result = validateImportRoleRow({
      name: 'Support',
      slug: 'Support Role',
      permissionKeys: 'users.read',
    });

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.field).toBe('slug');
  });
});

describe('parseImportRolePermissionKeys', () => {
  it('retourne toutes les permissions pour *', () => {
    const keys = parseImportRolePermissionKeys('*');
    expect(keys.length).toBeGreaterThan(10);
    expect(keys).toContain('users.read');
  });

  it('parse les clés séparées par point-virgule', () => {
    expect(parseImportRolePermissionKeys('users.read; roles.manage')).toEqual([
      'users.read',
      'roles.manage',
    ]);
  });
});
