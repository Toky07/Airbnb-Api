import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GetCartQueryHandler } from './GetCartQueryHandler';
import { GetCartQuery } from '../queries/GetCartQuery';
import { createSampleCart } from '../../cart-test.helpers';

describe('GetCartQueryHandler', () => {
  const resolveCartService = { resolve: vi.fn() };
  const cartPresenter = { toOutput: vi.fn() };
  let handler: GetCartQueryHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    resolveCartService.resolve.mockResolvedValue(createSampleCart());
    cartPresenter.toOutput.mockResolvedValue({ id: 5 });
    handler = new GetCartQueryHandler(
      resolveCartService as never,
      cartPresenter as never,
    );
  });

  it('retourne le panier résolu', async () => {
    const result = await handler.execute(new GetCartQuery({ authId: 1 }));

    expect(resolveCartService.resolve).toHaveBeenCalled();
    expect(result).toEqual({ id: 5 });
  });
});
