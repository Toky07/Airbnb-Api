import type { Cart } from '../entities/cart.entity';
import type { CartItem } from '../entities/cart-item.entity';

export const CART_REPOSITORY = 'CART_REPOSITORY';

export interface ICartRepository {
  findById(id: number): Promise<Cart | null>;
  findBySessionId(sessionId: string): Promise<Cart | null>;
  findByUserId(userId: number): Promise<Cart | null>;
  create(cart: Cart): Promise<Cart>;
  save(cart: Cart): Promise<Cart>;
  delete(id: number): Promise<void>;
  findItemById(itemId: number): Promise<CartItem | null>;
  addItem(cartId: number, item: CartItem): Promise<CartItem>;
  updateItem(item: CartItem): Promise<CartItem>;
  removeItem(itemId: number): Promise<void>;
  clearItems(cartId: number): Promise<void>;
  moveItems(fromCartId: number, toCartId: number): Promise<void>;
}
