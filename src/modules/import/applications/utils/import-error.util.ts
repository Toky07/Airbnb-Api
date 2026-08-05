import type { ImportRowError } from '../dto/import-batch.dto';
import type { ImportEntityResult } from '../dto/import-entity-result.dto';
import type { ImportRowValidationResult } from '../validation/import-row-validation.types';

type ImportRowValidationFailure = Extract<
  ImportRowValidationResult,
  { ok: false }
>;

export function toImportErrorMessage(cause: unknown): string {
  return cause instanceof Error ? cause.message : 'Création impossible.';
}

export function pushImportValidationError(
  result: ImportEntityResult,
  entity: ImportRowError['entity'],
  index: number,
  validation: ImportRowValidationFailure,
): void {
  result.errors.push({
    entity,
    index,
    field: validation.field,
    message: validation.message,
  });
}

export function pushImportRowError(
  result: ImportEntityResult,
  entity: ImportRowError['entity'],
  index: number,
  message: string,
  field?: string,
): void {
  result.errors.push({ entity, index, message, field });
}

export function mergeImportEntityResults(
  ...results: ImportEntityResult[]
): { created: number; errors: ImportRowError[] } {
  return results.reduce(
    (acc, result) => ({
      created: acc.created + result.created,
      errors: [...acc.errors, ...result.errors],
    }),
    { created: 0, errors: [] as ImportRowError[] },
  );
}
