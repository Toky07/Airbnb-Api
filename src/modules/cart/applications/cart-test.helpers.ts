import { vi } from 'vitest';
import { CART_ITEM_TYPE } from '../domain/constants/cart-item-type.constant';
import { Cart } from '../domain/entities/cart.entity';
import { CartItem } from '../domain/entities/cart-item.entity';

export function createSampleCartItem(
  overrides: Partial<{
    id: number;
    cartId: number;
    itemType: (typeof CART_ITEM_TYPE)[keyof typeof CART_ITEM_TYPE];
    roomId: number;
    totalPrice: number;
  }> = {},
): CartItem {
  return new CartItem(
    overrides.itemType ?? CART_ITEM_TYPE.RESERVATION,
    'Suite Deluxe · Hôtel Riviera',
    120,
    overrides.totalPrice ?? 360,
    1,
    3,
    overrides.roomId ?? 10,
    null,
    '2026-07-01',
    '2026-07-04',
    2,
    3,
    overrides.id ?? 1,
    overrides.cartId ?? 5,
    new Date('2026-06-10T10:00:00.000Z'),
    new Date('2026-06-10T10:00:00.000Z'),
  );
}

export function createSampleCart(
  overrides: Partial<{
    id: number;
    userId: number | null;
    sessionId: string;
    items: CartItem[];
  }> = {},
): Cart {
  const items = overrides.items ?? [createSampleCartItem({ cartId: overrides.id ?? 5 })];
  return new Cart(
    overrides.sessionId ?? 'session-abc',
    items,
    overrides.userId === undefined ? 1 : overrides.userId,
    overrides.id ?? 5,
    new Date('2026-06-10T10:00:00.000Z'),
    new Date('2026-06-10T10:00:00.000Z'),
  );
}

export function createCartRepositoryMock() {
  return {
    findById: vi.fn(),
    findBySessionId: vi.fn(),
    findByUserId: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
    addItem: vi.fn(),
    updateItem: vi.fn(),
    removeItem: vi.fn(),
    clearItems: vi.fn(),
    moveItems: vi.fn(),
  };
}

export function createCartUserPortMock() {
  return {
    findByAuthId: vi.fn(),
  };
}

export function createCartItemCatalogPortMock() {
  return {
    buildReservationItem: vi.fn(),
    updateReservationItem: vi.fn(),
  };
}

export function createCartProductSummaryPortMock() {
  return {
    getByRoomIds: vi.fn().mockResolvedValue(new Map()),
  };
}
