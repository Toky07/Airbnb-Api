import type { ImportBatchContext } from '../../services/import-batch-context.service';

export function createImportBatchContext(
  overrides: Partial<ImportBatchContext> = {},
): ImportBatchContext {
  return {
    emailToUserId: new Map<string, number>(),
    propertyKeyToId: new Map<string, number>(),
    propertyNameToId: new Map<string, number>(),
    propertyTypeSlugs: new Set<string>(),
    roomTypeSlugs: new Set<string>(),
    ...overrides,
  };
}
