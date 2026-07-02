import { mkdir, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { Injectable } from '@nestjs/common';
import { UPLOAD_ROOT } from '../../../media/constant';
import { toDiskPath } from '../../../media/utils/build-upload-path';
import { resolveUploadRoot } from '../../../media/utils/resolve-upload-root';

@Injectable()
export class InvoiceStorageService {
  async savePdf(invoiceNumber: string, buffer: Buffer): Promise<{
    path: string;
    fileName: string;
  }> {
    const fileName = `facture-${invoiceNumber}.pdf`;
    const safeName = fileName.replace(/[^\w.\- ]+/g, '_');
    const relativePath = join(UPLOAD_ROOT, 'invoices', safeName).replace(/\\/g, '/');
    const absolutePath = toDiskPath(relativePath, resolveUploadRoot());

    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, buffer);

    return {
      path: relativePath,
      fileName: safeName,
    };
  }
}
