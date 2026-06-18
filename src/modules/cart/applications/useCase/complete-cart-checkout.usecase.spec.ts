import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventBus } from '../../../../shared/domain/event.bus';
import { CartCheckoutCompleteVerifiedEvent } from '../../domain/events/cart-checkout-complete-verified.event';
import { CompleteCartCheckoutUseCase } from './complete-cart-checkout.usecase';
import {
  createCartRepositoryMock,
  createCartUserPortMock,
  createSampleCart,
} from '../cart-test.helpers';

describe('CompleteCartCheckoutUseCase', () => {
  const cartRepository = createCartRepositoryMock();
  const cartUserPort = createCartUserPortMock();
  const resolveCartService = { resolve: vi.fn() };
  const cartPresenter = { toOutput: vi.fn() };
  let useCase: CompleteCartCheckoutUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    EventBus.getInstance()['handlers'] = new Map();
    cartUserPort.findByAuthId.mockResolvedValue({ id: 1 });
    resolveCartService.resolve.mockResolvedValue(createSampleCart({ items: [] }));
    cartPresenter.toOutput.mockResolvedValue({ id: 5, items: [] });
    useCase = new CompleteCartCheckoutUseCase(
      cartRepository as never,
      cartUserPort as never,
      resolveCartService as never,
      cartPresenter as never,
    );
  });

  it('vide le panier après vérification du paiement', async () => {
    EventBus.getInstance().subscribe(
      'cart.checkout.complete.requested',
      async (event) => {
        await EventBus.getInstance().publish(
          new CartCheckoutCompleteVerifiedEvent(event.correlationId, 99, 5),
        );
      },
    );

    const result = await useCase.execute(10, 99, { authId: 10 });

    expect(cartRepository.clearItems).toHaveBeenCalledWith(5);
    expect(result).toEqual({ id: 5, items: [] });
  });
});
