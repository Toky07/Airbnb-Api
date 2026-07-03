import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MergeCartCommandHandler } from './MergeCartCommandHandler';
import { MergeCartCommand } from '../commands/MergeCartCommand';
import {
  createCartRepositoryMock,
  createCartUserPortMock,
  createSampleCart,
} from '../../cart-test.helpers';

describe('MergeCartCommandHandler', () => {
  const cartRepository = createCartRepositoryMock();
  const cartUserPort = createCartUserPortMock();
  const cartPresenter = { toOutput: vi.fn() };
  let handler: MergeCartCommandHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    cartUserPort.findByAuthId.mockResolvedValue({ id: 1 });
    cartRepository.findByUserId.mockResolvedValue(createSampleCart());
    cartPresenter.toOutput.mockResolvedValue({ id: 5 });
    handler = new MergeCartCommandHandler(
      cartRepository as never,
      cartUserPort,
      cartPresenter as never,
    );
  });

  it('fusionne le panier invité avec le panier utilisateur', async () => {
    const guestCart = createSampleCart({ id: 8, userId: null });
    cartRepository.findBySessionId.mockResolvedValue(guestCart);
    cartRepository.findByUserId.mockResolvedValue(createSampleCart({ id: 5 }));
    cartRepository.findById.mockResolvedValue(createSampleCart({ id: 5 }));

    await handler.execute(new MergeCartCommand(10, 'guest-session'));

    expect(cartRepository.moveItems).toHaveBeenCalledWith(8, 5);
  });
});
