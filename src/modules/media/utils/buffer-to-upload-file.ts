import type { UploadFile } from '../types/upload-file';

export function bufferToUploadFile(
  buffer: Buffer,
  options: {
    fieldname?: string;
    originalname: string;
    mimetype: string;
  },
): UploadFile {
  return {
    fieldname: options.fieldname ?? 'file',
    originalname: options.originalname,
    encoding: '7bit',
    mimetype: options.mimetype,
    size: buffer.length,
    buffer,
  };
}
