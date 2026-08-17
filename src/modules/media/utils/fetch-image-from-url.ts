import type { UploadFile } from '@src/modules/media/types/upload-file';
import { lookup } from 'node:dns/promises';
import { bufferToUploadFile } from './buffer-to-upload-file';
import {
  isBlockedIpAddress,
  isBlockedSsrfHostname,
} from './is-blocked-ssrf-target';

const FETCH_TIMEOUT_MS = 12_000;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_CONTENT_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

export async function fetchImageFromUrl(
  url: string,
): Promise<UploadFile | null> {
  const parsed = parseSafeHttpsUrl(url);
  if (!parsed) {
    return null;
  }

  const resolvedBlocked = await resolvesToBlockedAddress(parsed.hostname);
  if (resolvedBlocked) {
    return null;
  }

  try {
    const response = await fetch(parsed.toString(), {
      method: 'GET',
      redirect: 'error',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!response.ok) {
      return null;
    }

    const contentType =
      response.headers
        .get('content-type')
        ?.split(';')[0]
        ?.trim()
        .toLowerCase() ?? '';
    if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
      return null;
    }

    const contentLength = Number(response.headers.get('content-length'));
    if (Number.isFinite(contentLength) && contentLength > MAX_IMAGE_BYTES) {
      return null;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length === 0 || buffer.length > MAX_IMAGE_BYTES) {
      return null;
    }

    const extension = extensionFromContentType(contentType);

    return bufferToUploadFile(buffer, {
      fieldname: 'images',
      originalname: `import${extension}`,
      mimetype: contentType === 'image/jpg' ? 'image/jpeg' : contentType,
    });
  } catch {
    return null;
  }
}

function parseSafeHttpsUrl(url: string): URL | null {
  const trimmed = url.trim();
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  if (parsed.protocol !== 'https:') {
    return null;
  }

  if (parsed.username || parsed.password) {
    return null;
  }

  if (isBlockedSsrfHostname(parsed.hostname)) {
    return null;
  }

  return parsed;
}

async function resolvesToBlockedAddress(hostname: string): Promise<boolean> {
  if (isBlockedIpAddress(hostname)) {
    return true;
  }

  try {
    const addresses = await lookup(hostname, { all: true, verbatim: true });
    return addresses.some((entry) => isBlockedIpAddress(entry.address));
  } catch {
    return true;
  }
}

function extensionFromContentType(contentType: string): string {
  if (contentType.includes('png')) {
    return '.png';
  }
  if (contentType.includes('webp')) {
    return '.webp';
  }
  return '.jpg';
}
