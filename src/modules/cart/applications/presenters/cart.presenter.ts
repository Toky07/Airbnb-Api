import { Cart } from '../../domain/entities/cart.entity';
import { CartItemOutput } from '../dto/cart-item.output';
import { CartOutput } from '../dto/cart.output';

export class CartPresenter {
  static toOutput(cart: Cart): CartOutput {
    return new CartOutput(
      cart.id!,
      cart.sessionId,
      cart.userId,
      cart.items.map((item) => CartItemOutput.fromDomain(item)),
      cart.totalPrice,
      cart.itemCount,
      cart.createdAt!,
      cart.updatedAt!,
    );
  }
}
