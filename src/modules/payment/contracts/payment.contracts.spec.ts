import { describe, expect, it } from 'vitest';
import {
  CreatePaymentCommand,
  VerifyPaymentCommand,
  PAYMENT_GATEWAY,
  PAYMENT_REPOSITORY,
} from './index';

describe('payment/contracts', () => {
  it('expose les commands et tokens publics', () => {
    expect(
      new CreatePaymentCommand(100, 'eur', 'stripe', 1, 'reservation', 2),
    ).toBeInstanceOf(CreatePaymentCommand);
    expect(new VerifyPaymentCommand(9)).toEqual({ paymentId: 9 });
    expect(PAYMENT_GATEWAY).toBe('PAYMENT_GATEWAY');
    expect(PAYMENT_REPOSITORY).toBe('PAYMENT_REPOSITORY');
  });
});
