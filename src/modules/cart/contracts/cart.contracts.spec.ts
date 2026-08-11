import { describe, expect, it } from 'vitest';
import {
  CART_ITEM_CATALOG_PORT,
  CART_PRODUCT_SUMMARY_PORT,
  CART_USER_PORT,
  CartCheckoutRequestedEvent,
  CartCheckoutReservationCreatedEvent,
} from './index';

const emptyPricing = {
  subtotalCents: 1000,
  vatCents: 0,
  touristTaxCents: 0,
  serviceFeeCents: 0,
  totalCents: 1000,
  lines: [],
};

describe('cart/contracts', () => {
  it('expose tokens et events publics de checkout', () => {
    expect(CART_USER_PORT).toBe('CART_USER_PORT');
    expect(CART_ITEM_CATALOG_PORT).toBe('CART_ITEM_CATALOG_PORT');
    expect(CART_PRODUCT_SUMMARY_PORT).toBe('CART_PRODUCT_SUMMARY_PORT');
    expect(
      new CartCheckoutRequestedEvent('c1', 1, 2, 1000, [], emptyPricing),
    ).toBeInstanceOf(CartCheckoutRequestedEvent);
    expect(
      new CartCheckoutReservationCreatedEvent('c1', 1, 2, 3, 1000),
    ).toBeInstanceOf(CartCheckoutReservationCreatedEvent);
  });
});
