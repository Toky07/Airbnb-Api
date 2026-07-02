import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UpdateCartItemCommandHandler } from './UpdateCartItemCommandHandler';
import { UpdateCartItemCommand } from '../commands/UpdateCartItemCommand';
import {
  createCartItemCatalogPortMock,
  createCartRepositoryMock,
  createSampleCart,
} from '../../cart-test.helpers';

describe('UpdateCartItemCommandHandler', () => {
  const resolveCartService = { resolve: vi.fn() };
  const cartRepository = createCartRepositoryMock();
  const cartItemCatalog = createCartItemCatalogPortMock();
  const cartPresenter = { toOutput: vi.fn() };
  let handler: UpdateCartItemCommandHandler;

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
    handler = new UpdateCartItemCommandHandler(
      resolveCartService as never,
      cartRepository as never,
      cartItemCatalog as never,
      cartPresenter as never,
    );
  });

  it('met à jour un article de réservation', async () => {
    await handler.execute(
      new UpdateCartItemCommand({ authId: 1 }, 1, { guestCount: 3 }),
    );

    expect(cartItemCatalog.updateReservationItem).toHaveBeenCalled();
    expect(cartRepository.updateItem).toHaveBeenCalled();
  });
});
