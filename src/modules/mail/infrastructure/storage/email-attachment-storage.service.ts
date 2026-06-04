import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import type { UploadFile } from '../../../media/types/upload-file';
import type { EmailAttachment } from '../../domain/entities/email-attachment.entity';

@Injectable()
export class EmailAttachmentStorageService {
  private readonly rootDir = join(process.cwd(), 'uploads', 'emails');

  async saveMany(emailId: number, files: UploadFile[] = []): Promise<EmailAttachment[]> {
    if (!files.length) {
      return [];
    }

    const directory = join(this.rootDir, String(emailId));
    await mkdir(directory, { recursive: true });

    const attachments: EmailAttachment[] = [];

    for (const file of files) {
      const safeName = file.originalname.replace(/[^\w.\- ]+/g, '_');
      const storedName = `${randomUUID()}-${safeName}`;
      const absolutePath = join(directory, storedName);
      await writeFile(absolutePath, file.buffer);

      attachments.push({
        originalName: file.originalname,
        storedPath: join('uploads', 'emails', String(emailId), storedName).replace(/\\/g, '/'),
        mimeType: file.mimetype,
        size: file.size,
      });
    }

    return attachments;
  }
}
