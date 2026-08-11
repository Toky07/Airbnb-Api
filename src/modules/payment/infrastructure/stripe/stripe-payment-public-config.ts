import type { IPaymentPublicConfig } from '../../domain/ports/payment-public-config.port';
import { getStripePublishableKey } from './stripe.config';

export class StripePaymentPublicConfig implements IPaymentPublicConfig {
  getPublishableKey(): string {
    return getStripePublishableKey();
  }
}
