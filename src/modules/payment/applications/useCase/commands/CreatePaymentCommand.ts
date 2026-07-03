import { PaymentProvider } from '../../../domain/constants/payment-provider.constant';
import { PaymentType } from '../../../domain/types/payment.type';

export class CreatePaymentCommand {
  constructor(
    public readonly amount: number,
    public readonly currency: string,
    public readonly provider: PaymentProvider,
    public readonly userId: number,
    public readonly propertyType: PaymentType,
    public readonly propertyId: number,
    public readonly cartId: number | null = null,
  ) {}
}
