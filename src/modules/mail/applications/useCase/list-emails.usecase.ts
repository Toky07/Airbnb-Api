import { Inject, Injectable } from '@nestjs/common';
import type { PaginatedResult, PaginationParams } from '../../../../shared/pagination/pagination.types';
import {
  EMAIL_REPOSITORY,
  type IEmailRepository,
} from '../../domain/repositories/email.repository';
import { EmailOutput } from '../dto/email.output';

@Injectable()
export class ListEmailsUseCase {
  constructor(
    @Inject(EMAIL_REPOSITORY) private readonly repository: IEmailRepository,
  ) {}

  async execute(params: PaginationParams): Promise<PaginatedResult<EmailOutput>> {
    const result = await this.repository.findPaginated(params);
    return {
      data: result.data.map((email) => EmailOutput.fromDomain(email)),
      meta: result.meta,
    };
  }
}
