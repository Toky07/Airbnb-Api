import { ALL_PERMISSION_KEYS } from '@src/modules/authentication/contracts';
import type { ImportRoleRowDto } from '@src/modules/import/applications/dto/import-batch.dto';
import { ROLE_SLUG_PATTERN } from './import-validation.constants';
import type { ImportRowValidationResult } from './import-row-validation.types';
import { parseImportRolePermissionKeys } from './parse-import-role-permission-keys';

export function validateImportRoleRow(
  row: ImportRoleRowDto,
): ImportRowValidationResult {
  if (!row.name?.trim() || row.name.trim().length < 2) {
    return { ok: false, field: 'name', message: 'Nom du rôle requis.' };
  }

  const slug = row.slug?.trim();
  if (!slug) {
    return { ok: false, field: 'slug', message: 'Slug requis.' };
  }

  if (!ROLE_SLUG_PATTERN.test(slug)) {
    return {
      ok: false,
      field: 'slug',
      message: 'Slug invalide (lettres minuscules, chiffres et tirets).',
    };
  }

  const keys = parseImportRolePermissionKeys(row.permissionKeys);
  const unknown = keys.filter((key) => !ALL_PERMISSION_KEYS.includes(key));
  if (unknown.length > 0) {
    return {
      ok: false,
      field: 'permissionKeys',
      message: `Permission inconnue : ${unknown[0]}`,
    };
  }

  return { ok: true };
}
