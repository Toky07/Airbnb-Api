import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  EMAIL_REPOSITORY,
  type IEmailRepository,
} from '../../domain/repositories/email.repository';
import { EmailOutput } from '../dto/email.output';

@Injectable()
export class GetEmailUseCase {
  constructor(
    @Inject(EMAIL_REPOSITORY) private readonly repository: IEmailRepository,
  ) {}

  async execute(id: number): Promise<EmailOutput> {
    const email = await this.repository.findById(id);
    if (!email?.id) {
      throw new NotFoundException('Email not found');
    }
    return EmailOutput.fromDomain(email);
  }
}
