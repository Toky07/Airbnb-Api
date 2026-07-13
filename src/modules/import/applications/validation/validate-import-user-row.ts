import type { ImportUserRowDto } from '../dto/import-batch.dto';
import { DomainValidationException } from '../../../../shared/exceptions/domain-validation.exception';
import { validateUserFields } from '../../../user/applications/validation/validate-user-fields';
import type { ImportRowValidationResult } from './import-row-validation.types';

export function validateImportUserRow(
  row: ImportUserRowDto,
  index: number,
): ImportRowValidationResult {
  try {
    validateUserFields(row);
    return { ok: true };
  } catch (error) {
    if (error instanceof DomainValidationException) {
      const response = error.getResponse() as {
        errors?: { field: string; message: string }[];
      };
      const first = response.errors?.[0];
      return {
        ok: false,
        field: first?.field ?? `users[${index}]`,
        message: first?.message ?? 'Données utilisateur invalides.',
      };
    }
    return {
      ok: false,
      field: `users[${index}]`,
      message: 'Données utilisateur invalides.',
    };
  }
}
