import { Injectable } from '@nestjs/common';
import { InvoiceSequenceRepository } from '../../infrastructure/repositories/invoice-sequence.repository';

@Injectable()
export class InvoiceNumberService {
  constructor(
    private readonly invoiceSequenceRepository: InvoiceSequenceRepository,
  ) {}

  async generate(paidAt: Date): Promise<string> {
    const year = paidAt.getFullYear();
    const sequence = await this.invoiceSequenceRepository.getNextNumber(year);
    return `FACT-${year}-${String(sequence).padStart(6, '0')}`;
  }
}
