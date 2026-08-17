import { mkdir, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { randomUUID } from 'crypto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UPLOAD_ROOT } from '@src/modules/media/contracts';
import { toDiskPath } from '@src/modules/media/contracts';
import { resolveUploadRoot } from '@src/modules/media/contracts';
import type { UploadFile } from '@src/modules/media/contracts';
import type { EmailAttachment } from '@src/modules/mail/domain/entities/email-attachment.entity';
import {
  detectImageKind,
  isPdfBuffer,
} from '@src/modules/media/utils/detect-image-kind';

@Injectable()
export class EmailAttachmentStorageService {
  async saveMany(
    emailId: number,
    files: UploadFile[] = [],
  ): Promise<EmailAttachment[]> {
    if (!files.length) {
      return [];
    }

    const attachments: EmailAttachment[] = [];

    for (const file of files) {
      if (!detectImageKind(file.buffer) && !isPdfBuffer(file.buffer)) {
        throw new BadRequestException(
          'Pièce jointe invalide. Formats acceptés : JPEG, PNG, WebP, PDF.',
        );
      }

      const storedName = `${randomUUID()}`;
      const relativePath = join(
        UPLOAD_ROOT,
        'emails',
        String(emailId),
        storedName,
      ).replace(/\\/g, '/');
      const absolutePath = toDiskPath(relativePath, resolveUploadRoot());

      await mkdir(dirname(absolutePath), { recursive: true });
      await writeFile(absolutePath, file.buffer);

      attachments.push({
        originalName: file.originalname,
        storedPath: relativePath,
        mimeType: file.mimetype,
        size: file.size,
      });
    }

    return attachments;
  }
}
