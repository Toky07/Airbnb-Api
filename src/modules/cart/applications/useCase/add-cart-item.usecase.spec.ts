import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { CART_ITEM_TYPE } from '../../domain/constants/cart-item-type.constant';
import { AddCartItemUseCase } from './add-cart-item.usecase';
import {
  createCartRepositoryMock,
  createSampleCart,
  createSampleCartItem,
} from '../cart-test.helpers';

describe('AddCartItemUseCase', () => {
  const resolveCartService = { resolve: vi.fn() };
  const cartRepository = createCartRepositoryMock();
  const buildCartItemService = { fromDto: vi.fn() };
  const cartPresenter = { toOutput: vi.fn() };
  let useCase: AddCartItemUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    const cart = createSampleCart({ items: [] });
    resolveCartService.resolve.mockResolvedValue(cart);
    buildCartItemService.fromDto.mockResolvedValue(createSampleCartItem());
    cartRepository.addItem.mockResolvedValue(createSampleCartItem());
    cartRepository.findById.mockResolvedValue(createSampleCart());
    cartPresenter.toOutput.mockResolvedValue({ id: 5 });
    useCase = new AddCartItemUseCase(
      resolveCartService as never,
      cartRepository as never,
      buildCartItemService as never,
      cartPresenter as never,
    );
  });

  it('ajoute un article au panier', async () => {
    await useCase.execute({ authId: 1 }, {
      itemType: CART_ITEM_TYPE.RESERVATION,
      roomId: 10,
      startDate: '2026-07-01',
      endDate: '2026-07-04',
      guestCount: 2,
    });

    expect(cartRepository.addItem).toHaveBeenCalled();
  });

  it('refuse les doublons de réservation', async () => {
    resolveCartService.resolve.mockResolvedValue(createSampleCart());

    await expect(
      useCase.execute({ authId: 1 }, {
        itemType: CART_ITEM_TYPE.RESERVATION,
        roomId: 10,
        startDate: '2026-07-01',
        endDate: '2026-07-04',
        guestCount: 2,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
