import { UPLOAD_ROOT } from '@src/modules/media/constant';

export function resolveUploadRoot(): string {
  return process.env.UPLOAD_ROOT?.trim() || UPLOAD_ROOT;
}
