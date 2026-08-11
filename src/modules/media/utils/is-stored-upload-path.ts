import { UPLOAD_ROOT } from '@src/modules/media/constant';

export function isStoredUploadPath(path: string): boolean {
  return path.replace(/\\/g, '/').startsWith(`${UPLOAD_ROOT}/`);
}
