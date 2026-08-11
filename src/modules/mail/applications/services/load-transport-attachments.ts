import { readFile } from 'fs/promises';
import { join } from 'path';
import type { Email } from '@src/modules/mail/domain/entities/email.entity';
import type { MailTransportAttachment } from '@src/modules/mail/domain/ports/mail-transport.port';

export async function loadTransportAttachments(
  attachments: Email['attachments'],
): Promise<MailTransportAttachment[]> {
  const result: MailTransportAttachment[] = [];

  for (const attachment of attachments) {
    const absolutePath = join(process.cwd(), attachment.storedPath);
    const content = await readFile(absolutePath);
    result.push({
      filename: attachment.originalName,
      content,
      contentType: attachment.mimeType,
    });
  }

  return result;
}
