import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { CART_ITEM_TYPE } from '../../../domain/constants/cart-item-type.constant';
import { AddCartItemCommandHandler } from './AddCartItemCommandHandler';
import { AddCartItemCommand } from '../commands/AddCartItemCommand';
import {
  createCartRepositoryMock,
  createSampleCart,
  createSampleCartItem,
} from '../../cart-test.helpers';

describe('AddCartItemCommandHandler', () => {
  const resolveCartService = { resolve: vi.fn() };
  const cartRepository = createCartRepositoryMock();
  const buildCartItemService = { fromDto: vi.fn() };
  const cartPresenter = { toOutput: vi.fn() };
  let handler: AddCartItemCommandHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    const cart = createSampleCart({ items: [] });
    resolveCartService.resolve.mockResolvedValue(cart);
    buildCartItemService.fromDto.mockResolvedValue(createSampleCartItem());
    cartRepository.addItem.mockResolvedValue(createSampleCartItem());
    cartRepository.findById.mockResolvedValue(createSampleCart());
    cartPresenter.toOutput.mockResolvedValue({ id: 5 });
    handler = new AddCartItemCommandHandler(
      resolveCartService as never,
      cartRepository as never,
      buildCartItemService as never,
      cartPresenter as never,
    );
  });

  it('ajoute un article au panier', async () => {
    await handler.execute(
      new AddCartItemCommand(
        { authId: 1 },
        {
          itemType: CART_ITEM_TYPE.RESERVATION,
          roomId: 10,
          startDate: '2026-07-01',
          endDate: '2026-07-04',
          guestCount: 2,
        },
      ),
    );

    expect(cartRepository.addItem).toHaveBeenCalled();
  });

  it('refuse les doublons de réservation', async () => {
    resolveCartService.resolve.mockResolvedValue(createSampleCart());

    await expect(
      handler.execute(
        new AddCartItemCommand(
          { authId: 1 },
          {
            itemType: CART_ITEM_TYPE.RESERVATION,
            roomId: 10,
            startDate: '2026-07-01',
            endDate: '2026-07-04',
            guestCount: 2,
          },
        ),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
