import { UPLOAD_ROOT } from '../constant';

export function isStoredUploadPath(path: string): boolean {
  return path.startsWith(`${UPLOAD_ROOT}/`);
}
