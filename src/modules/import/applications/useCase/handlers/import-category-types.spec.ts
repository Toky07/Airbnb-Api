import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createImportBatchContext } from './import-test.helpers';
import {
  importCategoryTypes,
  type CategoryTypeImportConfig,
} from './import-category-types';

describe('importCategoryTypes', () => {
  const create = vi.fn();

  const config: CategoryTypeImportConfig = {
    entity: 'propertyType',
    getSlugSet: (context) => context.propertyTypeSlugs,
    create,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retourne un résultat vide sans lignes', async () => {
    const result = await importCategoryTypes(
      undefined,
      createImportBatchContext(),
      config,
    );

    expect(result).toEqual({ created: 0, errors: [] });
    expect(create).not.toHaveBeenCalled();
  });

  it('pousse une erreur de validation sans appeler create', async () => {
    const result = await importCategoryTypes(
      [{ name: '', sortOrder: 0, isActive: true }],
      createImportBatchContext(),
      config,
    );

    expect(result.created).toBe(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.entity).toBe('propertyType');
    expect(create).not.toHaveBeenCalled();
  });

  it('pousse une erreur quand create échoue', async () => {
    create.mockRejectedValueOnce(new Error('DB down'));

    const result = await importCategoryTypes(
      [{ name: 'Villa', sortOrder: 0, isActive: true }],
      createImportBatchContext(),
      config,
    );

    expect(result.created).toBe(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.message).toContain('DB down');
  });
});
