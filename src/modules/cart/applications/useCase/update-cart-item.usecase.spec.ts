import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UpdateCartItemUseCase } from './update-cart-item.usecase';
import {
  createCartItemCatalogPortMock,
  createCartRepositoryMock,
  createSampleCart,
  createSampleCartItem,
} from '../cart-test.helpers';

describe('UpdateCartItemUseCase', () => {
  const resolveCartService = { resolve: vi.fn() };
  const cartRepository = createCartRepositoryMock();
  const cartItemCatalog = createCartItemCatalogPortMock();
  const cartPresenter = { toOutput: vi.fn() };
  let useCase: UpdateCartItemUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    resolveCartService.resolve.mockResolvedValue(createSampleCart());
    cartItemCatalog.updateReservationItem.mockResolvedValue({
      label: 'Suite · Hôtel',
      unitPrice: 120,
      totalPrice: 480,
      nights: 4,
      propertyId: 3,
      roomId: 10,
    });
    cartRepository.findById.mockResolvedValue(createSampleCart());
    cartPresenter.toOutput.mockResolvedValue({ id: 5 });
    useCase = new UpdateCartItemUseCase(
      resolveCartService as never,
      cartRepository as never,
      cartItemCatalog as never,
      cartPresenter as never,
    );
  });

  it('met à jour un article de réservation', async () => {
    await useCase.execute({ authId: 1 }, 1, { guestCount: 3 });

    expect(cartItemCatalog.updateReservationItem).toHaveBeenCalled();
    expect(cartRepository.updateItem).toHaveBeenCalled();
  });
});
