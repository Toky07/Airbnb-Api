import { ALL_PERMISSION_KEYS } from '../../../authentication/domain/constants/permissions.constant';

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
