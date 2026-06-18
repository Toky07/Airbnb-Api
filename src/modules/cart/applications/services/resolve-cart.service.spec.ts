import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ResolveCartService } from './resolve-cart.service';
import {
  createCartRepositoryMock,
  createCartUserPortMock,
  createSampleCart,
} from '../cart-test.helpers';

describe('ResolveCartService', () => {
  const cartRepository = createCartRepositoryMock();
  const cartUserPort = createCartUserPortMock();
  let service: ResolveCartService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ResolveCartService(cartRepository as never, cartUserPort as never);
  });

  it('retourne le panier utilisateur existant', async () => {
    const cart = createSampleCart();
    cartUserPort.findByAuthId.mockResolvedValue({ id: 1 });
    cartRepository.findByUserId.mockResolvedValue(cart);

    const result = await service.resolve({ authId: 10 });

    expect(result).toBe(cart);
  });

  it('crée un panier invité quand aucune session n’existe', async () => {
    const created = createSampleCart({ userId: null });
    cartRepository.create.mockResolvedValue(created);

    const result = await service.resolve({ sessionId: 'guest-1' });

    expect(cartRepository.create).toHaveBeenCalled();
    expect(result).toBe(created);
  });
});
