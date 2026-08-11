import { Injectable } from '@nestjs/common';
import { PAYMENT_STATUS } from '@src/modules/payment/domain/constants/payment-status.constant';
import type { PaymentStatus } from '@src/modules/payment/domain/constants/payment-status.constant';

@Injectable()
export class MapStripeStatusService {
  fromPaymentIntentStatus(stripeStatus: string): PaymentStatus {
    switch (stripeStatus) {
      case 'processing':
      case 'requires_action':
      case 'requires_confirmation':
      case 'requires_payment_method':
        return PAYMENT_STATUS.PROCESSING;
      case 'succeeded':
        return PAYMENT_STATUS.SUCCEEDED;
      case 'canceled':
        return PAYMENT_STATUS.CANCELED;
      default:
        return PAYMENT_STATUS.FAILED;
    }
  }

  fromWebhookEventType(eventType: string, stripeStatus: string): PaymentStatus {
    if (eventType === 'payment_intent.succeeded') {
      return PAYMENT_STATUS.SUCCEEDED;
    }

    if (eventType === 'payment_intent.canceled') {
      return PAYMENT_STATUS.CANCELED;
    }

    if (
      eventType === 'payment_intent.payment_failed' ||
      eventType === 'payment_intent.failed'
    ) {
      return PAYMENT_STATUS.FAILED;
    }

    return this.fromPaymentIntentStatus(stripeStatus);
  }
}
