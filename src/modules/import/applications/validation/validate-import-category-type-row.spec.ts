import { describe, expect, it } from 'vitest';
import { validateImportCategoryTypeRow } from './validate-import-category-type-row';

describe('validateImportCategoryTypeRow', () => {
  it('valide un type de catégorie', () => {
    expect(
      validateImportCategoryTypeRow({
        name: 'Resort',
        sortOrder: 0,
        isActive: true,
      }).ok,
    ).toBe(true);
  });

  it('rejette un type sans nom', () => {
    expect(
      validateImportCategoryTypeRow({
        name: '',
        sortOrder: 0,
        isActive: true,
      }).ok,
    ).toBe(false);
  });

  it('rejette un ordre invalide', () => {
    const result = validateImportCategoryTypeRow({
      name: 'Resort',
      sortOrder: Number.NaN,
      isActive: true,
    });

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.field).toBe('sortOrder');
  });
});
