import { mkdir, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { Injectable } from '@nestjs/common';
import { UPLOAD_ROOT } from '@src/modules/media/contracts';
import { toDiskPath } from '@src/modules/media/contracts';
import { resolveUploadRoot } from '@src/modules/media/contracts';

@Injectable()
export class InvoiceStorageService {
  async savePdf(
    invoiceNumber: string,
    buffer: Buffer,
  ): Promise<{
    path: string;
    fileName: string;
  }> {
    const fileName = `facture-${invoiceNumber}.pdf`;
    const safeName = fileName.replace(/[^\w.\- ]+/g, '_');
    const relativePath = join(UPLOAD_ROOT, 'invoices', safeName).replace(
      /\\/g,
      '/',
    );
    const absolutePath = toDiskPath(relativePath, resolveUploadRoot());

    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, buffer);

    return {
      path: relativePath,
      fileName: safeName,
    };
  }
}
