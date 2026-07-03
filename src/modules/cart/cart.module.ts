import { Inject, Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomsModule } from '../rooms/room.module';
import { UserModule } from '../user/user.module';
import { BuildCartItemService } from './applications/services/build-cart-item.service';
import { ResolveCartService } from './applications/services/resolve-cart.service';
import { CartPresenter } from './applications/presenters/cart.presenter';
import {
  CART_REPOSITORY,
  type ICartRepository,
} from './domain/repositories/cart.repository';
import {
  CART_USER_PORT,
  type ICartUserPort,
} from './domain/ports/cart-user.port';
import {
  CART_ITEM_CATALOG_PORT,
  type ICartItemCatalogPort,
} from './domain/ports/cart-item-catalog.port';
import { CartItemOrmEntity } from './infrastructure/entities/cart-item.orm-entity';
import { CartOrmEntity } from './infrastructure/entities/cart.orm-entity';
import { CartRepository } from './infrastructure/repositories/cart.repository';
import { CartController } from './interfaces/http/cart.controller';
import { CartPaymentEvent } from './applications/events/register-cart-payment.event';
import { CartBootstrap } from './cart.bootstrap';
import { CommandBus } from '../../shared/useCase/bus/bus';
import { QueryBus } from '../../shared/useCase/bus/query-bus';
import { GetCartQuery } from './applications/useCase/queries/GetCartQuery';
import { AddCartItemCommand } from './applications/useCase/commands/AddCartItemCommand';
import { UpdateCartItemCommand } from './applications/useCase/commands/UpdateCartItemCommand';
import { RemoveCartItemCommand } from './applications/useCase/commands/RemoveCartItemCommand';
import { MergeCartCommand } from './applications/useCase/commands/MergeCartCommand';
import { CheckoutCartCommand } from './applications/useCase/commands/CheckoutCartCommand';
import { CompleteCartCheckoutCommand } from './applications/useCase/commands/CompleteCartCheckoutCommand';

@Module({
  imports: [
    TypeOrmModule.forFeature([CartOrmEntity, CartItemOrmEntity]),
    UserModule,
    RoomsModule,
  ],
  controllers: [CartController],
  providers: [
    CartRepository,
    {
      provide: CART_REPOSITORY,
      useClass: CartRepository,
    },
    ResolveCartService,
    BuildCartItemService,
    CartPresenter,
    CartPaymentEvent,
  ],
  exports: [CART_REPOSITORY],
})
export class CartModule implements OnModuleInit {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: ICartRepository,
    @Inject(CART_USER_PORT)
    private readonly cartUserPort: ICartUserPort,
    @Inject(CART_ITEM_CATALOG_PORT)
    private readonly cartItemCatalog: ICartItemCatalogPort,
    private readonly resolveCartService: ResolveCartService,
    private readonly buildCartItemService: BuildCartItemService,
    private readonly cartPresenter: CartPresenter,
  ) {}

  onModuleInit() {
    const bootstrap = CartBootstrap.create({
      cartRepository: this.cartRepository,
      cartUserPort: this.cartUserPort,
      cartItemCatalog: this.cartItemCatalog,
      resolveCartService: this.resolveCartService,
      buildCartItemService: this.buildCartItemService,
      cartPresenter: this.cartPresenter,
    });

    QueryBus.register(GetCartQuery, bootstrap.getCartQueryHandler);
    CommandBus.register(
      AddCartItemCommand,
      bootstrap.addCartItemCommandHandler,
    );
    CommandBus.register(
      UpdateCartItemCommand,
      bootstrap.updateCartItemCommandHandler,
    );
    CommandBus.register(
      RemoveCartItemCommand,
      bootstrap.removeCartItemCommandHandler,
    );
    CommandBus.register(MergeCartCommand, bootstrap.mergeCartCommandHandler);
    CommandBus.register(
      CheckoutCartCommand,
      bootstrap.checkoutCartCommandHandler,
    );
    CommandBus.register(
      CompleteCartCheckoutCommand,
      bootstrap.completeCartCheckoutCommandHandler,
    );
  }
}
