import { UPLOAD_ROOT } from '../constant';

export function isStoredUploadPath(path: string): boolean {
  return path.replace(/\\/g, '/').startsWith(`${UPLOAD_ROOT}/`);
}
