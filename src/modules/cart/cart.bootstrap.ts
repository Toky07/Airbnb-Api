import type { ICartRepository } from './domain/repositories/cart.repository';
import type { ICartUserPort } from './domain/ports/cart-user.port';
import type { ICartItemCatalogPort } from './domain/ports/cart-item-catalog.port';
import type { ResolveCartService } from './applications/services/resolve-cart.service';
import type { BuildCartItemService } from './applications/services/build-cart-item.service';
import type { CartPresenter } from './applications/presenters/cart.presenter';
import { GetCartQueryHandler } from './applications/useCase/handlers/GetCartQueryHandler';
import { AddCartItemCommandHandler } from './applications/useCase/handlers/AddCartItemCommandHandler';
import { UpdateCartItemCommandHandler } from './applications/useCase/handlers/UpdateCartItemCommandHandler';
import { RemoveCartItemCommandHandler } from './applications/useCase/handlers/RemoveCartItemCommandHandler';
import { MergeCartCommandHandler } from './applications/useCase/handlers/MergeCartCommandHandler';
import { CheckoutCartCommandHandler } from './applications/useCase/handlers/CheckoutCartCommandHandler';
import { CompleteCartCheckoutCommandHandler } from './applications/useCase/handlers/CompleteCartCheckoutCommandHandler';

export class CartBootstrap {
  static create(deps: {
    cartRepository: ICartRepository;
    cartUserPort: ICartUserPort;
    cartItemCatalog: ICartItemCatalogPort;
    resolveCartService: ResolveCartService;
    buildCartItemService: BuildCartItemService;
    cartPresenter: CartPresenter;
  }) {
    return {
      getCartQueryHandler: new GetCartQueryHandler(
        deps.resolveCartService,
        deps.cartPresenter,
      ),
      addCartItemCommandHandler: new AddCartItemCommandHandler(
        deps.resolveCartService,
        deps.cartRepository,
        deps.buildCartItemService,
        deps.cartPresenter,
      ),
      updateCartItemCommandHandler: new UpdateCartItemCommandHandler(
        deps.resolveCartService,
        deps.cartRepository,
        deps.cartItemCatalog,
        deps.cartPresenter,
      ),
      removeCartItemCommandHandler: new RemoveCartItemCommandHandler(
        deps.resolveCartService,
        deps.cartRepository,
        deps.cartPresenter,
      ),
      mergeCartCommandHandler: new MergeCartCommandHandler(
        deps.cartRepository,
        deps.cartUserPort,
        deps.cartPresenter,
      ),
      checkoutCartCommandHandler: new CheckoutCartCommandHandler(
        deps.resolveCartService,
        deps.buildCartItemService,
      ),
      completeCartCheckoutCommandHandler: new CompleteCartCheckoutCommandHandler(
        deps.cartRepository,
        deps.cartUserPort,
        deps.resolveCartService,
        deps.cartPresenter,
      ),
    };
  }
}
