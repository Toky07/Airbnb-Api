import {
  ForbiddenException,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { createReadStream, existsSync } from 'fs';
import { basename } from 'path';
import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { IUserRepository } from '../../../../user/contracts';
import type { IInvoiceRepository } from '../../../domain/repositories/invoice.repository';
import type { DownloadInvoiceQuery } from '../queries/DownloadInvoiceQuery';

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

    if (!existsSync(invoice.path)) {
      throw new NotFoundException('Fichier facture introuvable.');
    }

    const stream = createReadStream(invoice.path);
    return new StreamableFile(stream, {
      type: 'application/pdf',
      disposition: `attachment; filename="${basename(invoice.path)}"`,
    });
  }
}
