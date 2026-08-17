import { mkdir, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { UPLOAD_ROOT } from '@src/modules/media/contracts';
import { toDiskPath } from '@src/modules/media/contracts';
import { resolveUploadRoot } from '@src/modules/media/contracts';

@Injectable()
export class InvoiceStorageService {
  async savePdf(
    _invoiceNumber: string,
    buffer: Buffer,
  ): Promise<{
    path: string;
    fileName: string;
  }> {
    const fileName = `${randomUUID()}.pdf`;
    const relativePath = join(UPLOAD_ROOT, 'invoices', fileName).replace(
      /\\/g,
      '/',
    );
    const absolutePath = toDiskPath(relativePath, resolveUploadRoot());

    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, buffer);

    return {
      path: relativePath,
      fileName,
    };
  }
}
