import { Inject, Injectable } from '@nestjs/common';
import type { PaginatedResult } from '../../../../shared/pagination/pagination.types';
import type { PaginationParams } from '../../../../shared/pagination/pagination.types';
import {
  PAYMENT_REPOSITORY,
  type IPaymentRepository,
} from '../../domain/repositories/payment.repository';
import { PaymentOutput } from '../dto/payment.output';

@Injectable()
export class ListPaymentsUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(
    params: PaginationParams,
  ): Promise<PaginatedResult<PaymentOutput>> {
    const result = await this.paymentRepository.findPaginated(params);

    return {
      data: result.data.map((payment) => PaymentOutput.fromDomain(payment)),
      meta: result.meta,
    };
  }
}
