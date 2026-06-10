import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  PAYMENT_REPOSITORY,
  type IPaymentRepository,
} from '../../domain/repositories/payment.repository';
import {
  USER_REPOSITORY,
} from '../../../user/infrastructure/repositories/user.repository';
import type { IUserRepository } from '../../../user/domain/repositories/user.repository';
import { PaymentOutput } from '../dto/payment.output';

export type GetPaymentAccess = {
  authId: number;
  canReadAll: boolean;
};

@Injectable()
export class GetPaymentUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: number, access: GetPaymentAccess): Promise<PaymentOutput> {
    const payment = await this.paymentRepository.findById(id);

    if (!payment?.id) {
      throw new NotFoundException('Paiement introuvable.');
    }

    if (!access.canReadAll) {
      const user = await this.userRepository.findByAuthId(access.authId);
      if (!user?.id || user.id !== payment.userId) {
        throw new ForbiddenException('Accès refusé.');
      }
    }

    return PaymentOutput.fromDomain(payment);
  }
}
