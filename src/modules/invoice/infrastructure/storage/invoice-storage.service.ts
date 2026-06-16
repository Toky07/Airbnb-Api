import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InvoiceStorageService {
  private readonly rootDir = join(process.cwd(), 'uploads', 'invoices');

  async savePdf(invoiceNumber: string, buffer: Buffer): Promise<{
    path: string;
    fileName: string;
  }> {
    await mkdir(this.rootDir, { recursive: true });

    const fileName = `facture-${invoiceNumber}.pdf`;
    const safeName = fileName.replace(/[^\w.\- ]+/g, '_');
    const absolutePath = join(this.rootDir, safeName);
    await writeFile(absolutePath, buffer);

    return {
      path: join('uploads', 'invoices', safeName).replace(/\\/g, '/'),
      fileName: safeName,
    };
  }
}
