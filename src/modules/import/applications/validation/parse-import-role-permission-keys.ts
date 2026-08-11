import { ALL_PERMISSION_KEYS } from '@src/modules/authentication/contracts';

export function parseImportRolePermissionKeys(raw?: string): string[] {
  const trimmed = raw?.trim() ?? '';
  if (!trimmed || trimmed === '*' || trimmed.toLowerCase() === 'all') {
    return [...ALL_PERMISSION_KEYS];
  }

  return trimmed
    .split(';')
    .map((key) => key.trim())
    .filter(Boolean);
}
