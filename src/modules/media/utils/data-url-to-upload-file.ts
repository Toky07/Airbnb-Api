import { BadRequestException } from '@nestjs/common';
import type { UploadFile } from '@src/modules/media/types/upload-file';
import { bufferToUploadFile } from './buffer-to-upload-file';
import {
  detectImageKind,
  extensionForImageKind,
  mimeForImageKind,
} from './detect-image-kind';

const DATA_URL_PATTERN = /^data:([^;]+);base64,(.+)$/;

export function dataUrlToUploadFile(dataUrl: string): UploadFile {
  const match = DATA_URL_PATTERN.exec(dataUrl);
  if (!match) {
    throw new BadRequestException('Image invalide.');
  }

  const buffer = Buffer.from(match[2], 'base64');
  const kind = detectImageKind(buffer);
  if (!kind) {
    throw new BadRequestException(
      'Seules les images JPEG, PNG ou WebP sont acceptées.',
    );
  }

  const extension = extensionForImageKind(kind);

  return bufferToUploadFile(buffer, {
    fieldname: 'avatar',
    originalname: `avatar${extension}`,
    mimetype: mimeForImageKind(kind),
  });
}
