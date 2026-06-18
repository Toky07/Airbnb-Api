import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomsModule } from '../rooms/room.module';
import { UserModule } from '../user/user.module';
import { BuildCartItemService } from './applications/services/build-cart-item.service';
import { ResolveCartService } from './applications/services/resolve-cart.service';
import { CartPresenter } from './applications/presenters/cart.presenter';
import { AddCartItemUseCase } from './applications/useCase/add-cart-item.usecase';
import { CheckoutCartUseCase } from './applications/useCase/checkout-cart.usecase';
import { CompleteCartCheckoutUseCase } from './applications/useCase/complete-cart-checkout.usecase';
import { GetCartUseCase } from './applications/useCase/get-cart.usecase';
import { MergeCartUseCase } from './applications/useCase/merge-cart.usecase';
import { RemoveCartItemUseCase } from './applications/useCase/remove-cart-item.usecase';
import { UpdateCartItemUseCase } from './applications/useCase/update-cart-item.usecase';
import { CART_REPOSITORY } from './domain/repositories/cart.repository';
import { CartItemOrmEntity } from './infrastructure/entities/cart-item.orm-entity';
import { CartOrmEntity } from './infrastructure/entities/cart.orm-entity';
import { CartRepository } from './infrastructure/repositories/cart.repository';
import { CartController } from './interfaces/http/cart.controller';

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
    GetCartUseCase,
    AddCartItemUseCase,
    UpdateCartItemUseCase,
    RemoveCartItemUseCase,
    MergeCartUseCase,
    CheckoutCartUseCase,
    CompleteCartCheckoutUseCase,
  ],
  exports: [CART_REPOSITORY],
})
export class CartModule {}
