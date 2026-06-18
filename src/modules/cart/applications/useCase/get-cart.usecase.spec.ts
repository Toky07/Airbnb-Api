import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GetCartUseCase } from './get-cart.usecase';
import { ResolveCartService } from '../services/resolve-cart.service';
import { CartPresenter } from '../presenters/cart.presenter';
import { createSampleCart } from '../cart-test.helpers';

describe('GetCartUseCase', () => {
  const resolveCartService = { resolve: vi.fn() };
  const cartPresenter = { toOutput: vi.fn() };
  let useCase: GetCartUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    resolveCartService.resolve.mockResolvedValue(createSampleCart());
    cartPresenter.toOutput.mockResolvedValue({ id: 5 });
    useCase = new GetCartUseCase(
      resolveCartService as unknown as ResolveCartService,
      cartPresenter as unknown as CartPresenter,
    );
  });

  it('retourne le panier résolu', async () => {
    const result = await useCase.execute({ authId: 1 });

    expect(resolveCartService.resolve).toHaveBeenCalled();
    expect(result).toEqual({ id: 5 });
  });
});
