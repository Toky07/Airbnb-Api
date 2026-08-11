import type { IPaymentPublicConfig } from '@src/modules/payment/domain/ports/payment-public-config.port';
import { getStripePublishableKey } from './stripe.config';

export class StripePaymentPublicConfig implements IPaymentPublicConfig {
  getPublishableKey(): string {
    return getStripePublishableKey();
  }
}
