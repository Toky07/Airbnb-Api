import type { UploadFile } from '../types/upload-file';
import { bufferToUploadFile } from './buffer-to-upload-file';

const DATA_URL_PATTERN = /^data:([^;]+);base64,(.+)$/;

function extensionFromMimetype(mimetype: string): string {
  if (mimetype === 'image/png') return '.png';
  if (mimetype === 'image/jpeg') return '.jpg';
  if (mimetype === 'image/webp') return '.webp';
  if (mimetype === 'image/gif') return '.gif';
  return '';
}

export function dataUrlToUploadFile(dataUrl: string): UploadFile {
  const match = DATA_URL_PATTERN.exec(dataUrl);
  if (!match) {
    throw new Error('Invalid data URL');
  }

  const mimetype = match[1];
  const buffer = Buffer.from(match[2], 'base64');
  const extension = extensionFromMimetype(mimetype);

  return bufferToUploadFile(buffer, {
    fieldname: 'avatar',
    originalname: `avatar${extension}`,
    mimetype,
  });
}
