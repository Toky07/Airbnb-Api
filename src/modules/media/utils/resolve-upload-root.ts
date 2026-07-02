import { UPLOAD_ROOT } from '../constant';

export function resolveUploadRoot(): string {
  return process.env.UPLOAD_ROOT?.trim() || UPLOAD_ROOT;
}
