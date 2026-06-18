import { describe, expect, it } from 'vitest';
import { createSampleCart } from '../../applications/cart-test.helpers';

describe('Cart entity', () => {
  it('calcule le total et le nombre d’articles', () => {
    const cart = createSampleCart();

    expect(cart.totalPrice).toBe(360);
    expect(cart.itemCount).toBe(1);
  });
});
