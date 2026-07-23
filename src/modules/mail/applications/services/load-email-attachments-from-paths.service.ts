import { readFile } from 'fs/promises';
import { Injectable } from '@nestjs/common';
import { toDiskPath } from '../../../media/utils/build-upload-path';
import { resolveUploadRoot } from '../../../media/utils/resolve-upload-root';
import type { UploadFile } from '../../../media/types/upload-file';
import type { EmailSendAttachmentPayload } from '../../domain/events/email-send-requested.event';

@Injectable()
export class LoadEmailAttachmentsFromPathsService {
  async execute(
    attachments: EmailSendAttachmentPayload[] = [],
  ): Promise<UploadFile[]> {
    const files: UploadFile[] = [];

    for (const attachment of attachments) {
      const absolutePath = toDiskPath(attachment.path, resolveUploadRoot());
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
