import { getApiPublicUrl } from '@src/config/env.config';
import { isStoredUploadPath } from './is-stored-upload-path';

/**
 * Transforme un chemin relatif `uploads/...` en URL absolue (`API_PUBLIC_URL` + path).
 * Laisse inchangés les URLs déjà absolues, data URLs, et tout autre chemin.
 */
export function resolveMediaPublicUrl(
  path: string | null | undefined,
): string | null {
  if (path == null) {
    return null;
  }

  const trimmed = path.trim();
  if (!trimmed) {
    return path;
  }

  const normalized = trimmed.replace(/\\/g, '/');

  if (
    normalized.startsWith('data:') ||
    normalized.startsWith('http://') ||
    normalized.startsWith('https://') ||
    normalized.startsWith('blob:') ||
    !isStoredUploadPath(normalized)
  ) {
    return normalized;
  }

  return `${getApiPublicUrl()}/${normalized}`;
}
