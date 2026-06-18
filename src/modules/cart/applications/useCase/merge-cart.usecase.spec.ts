import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MergeCartUseCase } from './merge-cart.usecase';
import {
  createCartRepositoryMock,
  createCartUserPortMock,
  createSampleCart,
} from '../cart-test.helpers';

describe('MergeCartUseCase', () => {
  const cartRepository = createCartRepositoryMock();
  const cartUserPort = createCartUserPortMock();
  const cartPresenter = { toOutput: vi.fn() };
  let useCase: MergeCartUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    cartUserPort.findByAuthId.mockResolvedValue({ id: 1 });
    cartRepository.findByUserId.mockResolvedValue(createSampleCart());
    cartPresenter.toOutput.mockResolvedValue({ id: 5 });
    useCase = new MergeCartUseCase(
      cartRepository as never,
      cartUserPort as never,
      cartPresenter as never,
    );
  });

  it('fusionne le panier invité avec le panier utilisateur', async () => {
    const guestCart = createSampleCart({ id: 8, userId: null });
    cartRepository.findBySessionId.mockResolvedValue(guestCart);
    cartRepository.findByUserId.mockResolvedValue(createSampleCart({ id: 5 }));
    cartRepository.findById.mockResolvedValue(createSampleCart({ id: 5 }));

    await useCase.execute(10, 'guest-session');

    expect(cartRepository.moveItems).toHaveBeenCalledWith(8, 5);
  });
});
