import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { RemoveCartItemCommandHandler } from './RemoveCartItemCommandHandler';
import { RemoveCartItemCommand } from '../commands/RemoveCartItemCommand';
import {
  createCartRepositoryMock,
  createSampleCart,
} from '../../cart-test.helpers';

describe('RemoveCartItemCommandHandler', () => {
  const resolveCartService = { resolve: vi.fn() };
  const cartRepository = createCartRepositoryMock();
  const cartPresenter = { toOutput: vi.fn() };
  let handler: RemoveCartItemCommandHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    resolveCartService.resolve.mockResolvedValue(createSampleCart());
    cartRepository.findById.mockResolvedValue(createSampleCart({ items: [] }));
    cartPresenter.toOutput.mockResolvedValue({ id: 5, items: [] });
    handler = new RemoveCartItemCommandHandler(
      resolveCartService as never,
      cartRepository as never,
      cartPresenter as never,
    );
  });

  it('supprime un article du panier', async () => {
    await handler.execute(new RemoveCartItemCommand({ authId: 1 }, 1));

    expect(cartRepository.removeItem).toHaveBeenCalledWith(1);
  });

  it('lève une erreur si l’article est introuvable', async () => {
    resolveCartService.resolve.mockResolvedValue(createSampleCart({ items: [] }));

    await expect(
      handler.execute(new RemoveCartItemCommand({ authId: 1 }, 99)),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
