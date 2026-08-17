import { BadRequestException } from '@nestjs/common';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import {
  isAllowedImageExtension,
  isAllowedImageMimeType,
} from './detect-image-kind';

export const IMAGE_UPLOAD_MAX_BYTES = 5 * 1024 * 1024;
export const ATTACHMENT_UPLOAD_MAX_BYTES = 5 * 1024 * 1024;

const ALLOWED_ATTACHMENT_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

const ALLOWED_ATTACHMENT_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.pdf',
]);

function extensionOf(filename: string | undefined): string {
  const name = filename?.trim().toLowerCase() ?? '';
  const dot = name.lastIndexOf('.');
  return dot >= 0 ? name.slice(dot) : '';
}

export function getImageMulterOptions(): MulterOptions {
  return {
    limits: { fileSize: IMAGE_UPLOAD_MAX_BYTES, files: 10 },
    fileFilter: (_request, file, callback) => {
      if (
        !isAllowedImageMimeType(file.mimetype) ||
        !isAllowedImageExtension(file.originalname)
      ) {
        callback(
          new BadRequestException(
            'Seules les images JPEG, PNG ou WebP sont acceptées.',
          ),
          false,
        );
        return;
      }
      callback(null, true);
    },
  };
}

export function getAttachmentMulterOptions(): MulterOptions {
  return {
    limits: { fileSize: ATTACHMENT_UPLOAD_MAX_BYTES, files: 5 },
    fileFilter: (_request, file, callback) => {
      const mime = file.mimetype?.split(';')[0]?.trim().toLowerCase() ?? '';
      const extension = extensionOf(file.originalname);
      if (
        !ALLOWED_ATTACHMENT_MIME_TYPES.has(mime) ||
        !ALLOWED_ATTACHMENT_EXTENSIONS.has(extension)
      ) {
        callback(
          new BadRequestException(
            'Pièce jointe invalide. Formats acceptés : JPEG, PNG, WebP, PDF.',
          ),
          false,
        );
        return;
      }
      callback(null, true);
    },
  };
}
