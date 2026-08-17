import { extname } from 'path';
import { ALLOWED_IMAGE_EXTENSIONS } from './detect-image-kind';
import { UPLOAD_ROOT } from '@src/modules/media/constant';

const PRIVATE_PREFIXES = ['invoices/', 'emails/'];

export function normalizeUploadRelativePath(path: string): string {
  return path.replace(/\\/g, '/').replace(/^\/+/, '');
}

export function isPublicUploadPath(requestPath: string): boolean {
  let relative = normalizeUploadRelativePath(requestPath);

  if (relative.startsWith(`${UPLOAD_ROOT}/`)) {
    relative = relative.slice(UPLOAD_ROOT.length + 1);
  }

  if (!relative || relative.includes('..') || relative.includes('\0')) {
    return false;
  }

  if (PRIVATE_PREFIXES.some((prefix) => relative.startsWith(prefix))) {
    return false;
  }

  const extension = extname(relative).toLowerCase();
  return (ALLOWED_IMAGE_EXTENSIONS as readonly string[]).includes(extension);
}
