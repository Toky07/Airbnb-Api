import { describe, expect, it } from 'vitest';
import {
  CreatePaymentCommand,
  PAYMENT_GATEWAY,
  PAYMENT_PUBLIC_CONFIG,
  PAYMENT_REPOSITORY,
  PAYMENT_STATUS,
  PAYMENT_TYPE,
  VerifyPaymentCommand,
} from './index';

describe('payment/contracts', () => {
  it('expose les commands, constantes et tokens publics', () => {
    expect(
      new CreatePaymentCommand(100, 'eur', 'stripe', 1, 'reservation', 2),
    ).toBeInstanceOf(CreatePaymentCommand);
    expect(new VerifyPaymentCommand(9, 1)).toEqual({
      paymentId: 9,
      ownerAuthId: 1,
    });
    expect(PAYMENT_GATEWAY).toBe('PAYMENT_GATEWAY');
    expect(PAYMENT_PUBLIC_CONFIG).toBe('PAYMENT_PUBLIC_CONFIG');
    expect(PAYMENT_REPOSITORY).toBe('PAYMENT_REPOSITORY');
    expect(PAYMENT_STATUS.SUCCEEDED).toBe('succeeded');
    expect(PAYMENT_TYPE.RESERVATION).toBe('reservation');
  });
});
