import { mkdir, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { UPLOAD_ROOT } from '../../../media/contracts';
import { toDiskPath } from '../../../media/contracts';
import { resolveUploadRoot } from '../../../media/contracts';
import type { UploadFile } from '../../../media/contracts';
import type { EmailAttachment } from '../../domain/entities/email-attachment.entity';

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
      const safeName = file.originalname.replace(/[^\w.\- ]+/g, '_');
      const storedName = `${randomUUID()}-${safeName}`;
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
