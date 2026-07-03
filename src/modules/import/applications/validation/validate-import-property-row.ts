import type { ImportPropertyRowDto } from '../dto/import-batch.dto';
import { TIME_PATTERN } from './import-validation.constants';
import type { ImportRowValidationResult } from './import-row-validation.types';

export function validateImportPropertyRow(
  row: ImportPropertyRowDto,
): ImportRowValidationResult {
  if (!row.name?.trim() || row.name.trim().length < 2) {
    return { ok: false, field: 'name', message: 'Nom trop court.' };
  }
  if (!row.description?.trim() || row.description.trim().length < 10) {
    return {
      ok: false,
      field: 'description',
      message: 'Description trop courte.',
    };
  }
  if (!row.ownerEmail?.trim()) {
    return {
      ok: false,
      field: 'ownerEmail',
      message: 'E-mail propriétaire requis.',
    };
  }
  if (!TIME_PATTERN.test(row.checkInTime ?? '')) {
    return { ok: false, field: 'checkInTime', message: 'Format HH:mm requis.' };
  }
  if (!TIME_PATTERN.test(row.checkOutTime ?? '')) {
    return {
      ok: false,
      field: 'checkOutTime',
      message: 'Format HH:mm requis.',
    };
  }
  if (Number.isNaN(row.latitude) || row.latitude < -90 || row.latitude > 90) {
    return { ok: false, field: 'latitude', message: 'Latitude invalide.' };
  }
  if (
    Number.isNaN(row.longitude) ||
    row.longitude < -180 ||
    row.longitude > 180
  ) {
    return { ok: false, field: 'longitude', message: 'Longitude invalide.' };
  }
  return { ok: true };
}
