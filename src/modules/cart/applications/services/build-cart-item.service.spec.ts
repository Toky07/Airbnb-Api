import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CART_ITEM_TYPE } from '../../domain/constants/cart-item-type.constant';
import { BuildCartItemService } from './build-cart-item.service';
import {
  createCartItemCatalogPortMock,
  createSampleCart,
} from '../cart-test.helpers';

describe('BuildCartItemService', () => {
  const cartItemCatalog = createCartItemCatalogPortMock();
  let service: BuildCartItemService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new BuildCartItemService(cartItemCatalog as never);
    cartItemCatalog.buildReservationItem.mockResolvedValue({
      label: 'Suite · Hôtel',
      unitPrice: 120,
      totalPrice: 360,
      nights: 3,
      propertyId: 3,
      roomId: 10,
    });
  });

  it('construit un article de réservation via le port catalogue', async () => {
    const item = await service.fromDto({
      itemType: CART_ITEM_TYPE.RESERVATION,
      roomId: 10,
      startDate: '2026-07-01',
      endDate: '2026-07-04',
      guestCount: 2,
    });

    expect(item.totalPrice).toBe(360);
    expect(cartItemCatalog.buildReservationItem).toHaveBeenCalled();
  });

  it('extrait les items checkout du panier', () => {
    const items = service.buildCheckoutItems(createSampleCart());

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      roomId: 10,
      guestCount: 2,
    });
  });
});
