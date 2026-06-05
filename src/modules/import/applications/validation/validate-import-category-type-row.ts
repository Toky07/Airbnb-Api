import type { ImportCategoryTypeRowDto } from '../dto/import-batch.dto';
import type { ImportRowValidationResult } from './import-row-validation.types';

export function validateImportCategoryTypeRow(
  row: ImportCategoryTypeRowDto,
): ImportRowValidationResult {
  if (!row.name?.trim()) {
    return { ok: false, field: 'name', message: 'Le nom est requis.' };
  }
  if (!Number.isFinite(row.sortOrder)) {
    return { ok: false, field: 'sortOrder', message: 'Ordre invalide.' };
  }
  return { ok: true };
}
