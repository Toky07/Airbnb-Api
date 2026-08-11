import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CartPresenter } from './cart.presenter';
import {
  createCartProductSummaryPortMock,
  createSampleCart,
} from '@src/modules/cart/applications/cart-test.helpers';

describe('CartPresenter', () => {
  const productSummaryPort = createCartProductSummaryPortMock();
  let presenter: CartPresenter;

  beforeEach(() => {
    vi.clearAllMocks();
    presenter = new CartPresenter(productSummaryPort);
  });

  it('présente un panier avec ses articles', async () => {
    const output = await presenter.toOutput(createSampleCart());

    expect(output.id).toBe(5);
    expect(output.items).toHaveLength(1);
    expect(output.totalPrice).toBe(360);
  });
});
