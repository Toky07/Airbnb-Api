import { NotFoundException } from '@nestjs/common';
import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { IEmailRepository } from '../../../domain/repositories/email.repository';
import { EmailOutput } from '../../dto/email.output';
import type { GetEmailQuery } from '../queries/GetEmailQuery';

export class GetEmailQueryHandler implements IQueryHandler<
  GetEmailQuery,
  EmailOutput
> {
  constructor(private readonly repository: IEmailRepository) {}

  async execute(query: GetEmailQuery): Promise<EmailOutput> {
    const email = await this.repository.findById(query.id);
    if (!email?.id) {
      throw new NotFoundException('Email not found');
    }
    return EmailOutput.fromDomain(email);
  }
}
