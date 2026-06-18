import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { RemoveCartItemUseCase } from './remove-cart-item.usecase';
import {
  createCartRepositoryMock,
  createSampleCart,
} from '../cart-test.helpers';

describe('RemoveCartItemUseCase', () => {
  const resolveCartService = { resolve: vi.fn() };
  const cartRepository = createCartRepositoryMock();
  const cartPresenter = { toOutput: vi.fn() };
  let useCase: RemoveCartItemUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    resolveCartService.resolve.mockResolvedValue(createSampleCart());
    cartRepository.findById.mockResolvedValue(createSampleCart({ items: [] }));
    cartPresenter.toOutput.mockResolvedValue({ id: 5, items: [] });
    useCase = new RemoveCartItemUseCase(
      resolveCartService as never,
      cartRepository as never,
      cartPresenter as never,
    );
  });

  it('supprime un article du panier', async () => {
    await useCase.execute({ authId: 1 }, 1);

    expect(cartRepository.removeItem).toHaveBeenCalledWith(1);
  });

  it('lève une erreur si l’article est introuvable', async () => {
    resolveCartService.resolve.mockResolvedValue(createSampleCart({ items: [] }));

    await expect(useCase.execute({ authId: 1 }, 99)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
