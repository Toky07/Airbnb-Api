import type { ImportRoomRowDto } from '../dto/import-batch.dto';
import { ROOM_STATUSES } from './import-validation.constants';
import type { ImportRowValidationResult } from './import-row-validation.types';

export function validateImportRoomRow(row: ImportRoomRowDto): ImportRowValidationResult {
  if (!row.name?.trim()) {
    return { ok: false, field: 'name', message: 'Nom requis.' };
  }
  if (!row.description?.trim() || row.description.trim().length < 10) {
    return { ok: false, field: 'description', message: 'Description trop courte.' };
  }
  if (!row.propertyName?.trim()) {
    return { ok: false, field: 'propertyName', message: 'Nom établissement requis.' };
  }
  if (!ROOM_STATUSES.has(row.status)) {
    return {
      ok: false,
      field: 'status',
      message: 'Statut : available, occupied ou maintenance.',
    };
  }
  if (row.pricePerNight <= 0) {
    return { ok: false, field: 'pricePerNight', message: 'Prix invalide.' };
  }
  return { ok: true };
}
