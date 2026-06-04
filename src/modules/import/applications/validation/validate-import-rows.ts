import type {
  ImportCategoryTypeRowDto,
  ImportPropertyRowDto,
  ImportRoleRowDto,
  ImportRoomRowDto,
  ImportUserRowDto,
} from '../dto/import-batch.dto';
import { ALL_PERMISSION_KEYS } from '../../../authentication/domain/constants/permissions.constant';
import { DomainValidationException } from '../../../../shared/exceptions/domain-validation.exception';
import { validateUserFields } from '../../../user/application/validation/validate-user-fields';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const ROOM_STATUSES = new Set(['available', 'occupied', 'maintenance']);

export function validateImportUserRow(
  row: ImportUserRowDto,
  index: number,
): { ok: true } | { ok: false; field: string; message: string } {
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

export function validateImportPropertyRow(
  row: ImportPropertyRowDto,
): { ok: true } | { ok: false; field: string; message: string } {
  if (!row.name?.trim() || row.name.trim().length < 2) {
    return { ok: false, field: 'name', message: 'Nom trop court.' };
  }
  if (!row.description?.trim() || row.description.trim().length < 10) {
    return { ok: false, field: 'description', message: 'Description trop courte.' };
  }
  if (!row.ownerEmail?.trim()) {
    return { ok: false, field: 'ownerEmail', message: 'E-mail propriétaire requis.' };
  }
  if (!TIME_PATTERN.test(row.checkInTime ?? '')) {
    return { ok: false, field: 'checkInTime', message: 'Format HH:mm requis.' };
  }
  if (!TIME_PATTERN.test(row.checkOutTime ?? '')) {
    return { ok: false, field: 'checkOutTime', message: 'Format HH:mm requis.' };
  }
  if (Number.isNaN(row.latitude) || row.latitude < -90 || row.latitude > 90) {
    return { ok: false, field: 'latitude', message: 'Latitude invalide.' };
  }
  if (Number.isNaN(row.longitude) || row.longitude < -180 || row.longitude > 180) {
    return { ok: false, field: 'longitude', message: 'Longitude invalide.' };
  }
  return { ok: true };
}

export function validateImportRoomRow(
  row: ImportRoomRowDto,
): { ok: true } | { ok: false; field: string; message: string } {
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

export function validateImportCategoryTypeRow(
  row: ImportCategoryTypeRowDto,
): { ok: true } | { ok: false; field: string; message: string } {
  if (!row.name?.trim()) {
    return { ok: false, field: 'name', message: 'Le nom est requis.' };
  }
  if (!Number.isFinite(row.sortOrder)) {
    return { ok: false, field: 'sortOrder', message: 'Ordre invalide.' };
  }
  return { ok: true };
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function parseRolePermissionKeys(raw?: string): string[] {
  const trimmed = raw?.trim() ?? '';
  if (!trimmed || trimmed === '*' || trimmed.toLowerCase() === 'all') {
    return [...ALL_PERMISSION_KEYS];
  }

  return trimmed
    .split(';')
    .map((key) => key.trim())
    .filter(Boolean);
}

export function validateImportRoleRow(
  row: ImportRoleRowDto,
): { ok: true } | { ok: false; field: string; message: string } {
  if (!row.name?.trim() || row.name.trim().length < 2) {
    return { ok: false, field: 'name', message: 'Nom du rôle requis.' };
  }

  const slug = row.slug?.trim();
  if (!slug) {
    return { ok: false, field: 'slug', message: 'Slug requis.' };
  }

  if (!SLUG_PATTERN.test(slug)) {
    return {
      ok: false,
      field: 'slug',
      message: 'Slug invalide (lettres minuscules, chiffres et tirets).',
    };
  }

  const keys = parseRolePermissionKeys(row.permissionKeys);
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

export function parseImageUrlList(value?: string): string[] {
  if (!value?.trim()) {
    return [];
  }
  return value
    .split(';')
    .map((url) => url.trim())
    .filter(Boolean);
}
