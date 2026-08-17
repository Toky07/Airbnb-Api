import {
  ForbiddenException,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { createReadStream, existsSync } from 'fs';
import { isAbsolute } from 'path';
import { resolveUploadRoot, toDiskPath } from '@src/modules/media/contracts';
import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import type { IUserRepository } from '@src/modules/user/contracts';
import type { IInvoiceRepository } from '@src/modules/invoice/domain/repositories/invoice.repository';
import type { DownloadInvoiceQuery } from '@src/modules/invoice/applications/useCase/queries/DownloadInvoiceQuery';

export class DownloadInvoiceQueryHandler implements IQueryHandler<
  DownloadInvoiceQuery,
  StreamableFile
> {
  constructor(
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: DownloadInvoiceQuery): Promise<StreamableFile> {
    const invoice = await this.invoiceRepository.findById(query.invoiceId);
    if (!invoice) {
      throw new NotFoundException('Facture introuvable.');
    }

    if (!query.canReadAll) {
      const user = query.authId
        ? await this.userRepository.findByAuthId(query.authId)
        : null;
      if (!user?.id || user.id !== invoice.userId) {
        throw new ForbiddenException('Accès refusé.');
      }
    }

    const absolutePath = isAbsolute(invoice.path)
      ? invoice.path
      : toDiskPath(invoice.path, resolveUploadRoot());

    if (!existsSync(absolutePath)) {
      throw new NotFoundException('Fichier facture introuvable.');
    }

    const downloadName = `facture-${invoice.invoiceNumber}.pdf`;
    const stream = createReadStream(absolutePath);
    return new StreamableFile(stream, {
      type: 'application/pdf',
      disposition: `attachment; filename="${downloadName}"`,
    });
  }
}
