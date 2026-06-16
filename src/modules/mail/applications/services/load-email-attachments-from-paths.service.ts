import { readFile } from 'fs/promises';
import { join } from 'path';
import { Injectable } from '@nestjs/common';
import type { UploadFile } from '../../../media/types/upload-file';
import type { EmailSendAttachmentPayload } from '../../domain/events/email-send-requested.event';

@Injectable()
export class LoadEmailAttachmentsFromPathsService {
  async execute(
    attachments: EmailSendAttachmentPayload[] = [],
  ): Promise<UploadFile[]> {
    const files: UploadFile[] = [];

    for (const attachment of attachments) {
      const absolutePath = join(process.cwd(), attachment.path);
      const buffer = await readFile(absolutePath);

      files.push({
        fieldname: 'attachments',
        originalname: attachment.filename,
        encoding: '7bit',
        mimetype: attachment.mimeType ?? 'application/octet-stream',
        size: buffer.length,
        buffer,
      });
    }

    return files;
  }
}
