import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalculateStayAmountService } from '../../shared/pricing/calculate-stay-amount.service';
import { PaymentModule } from '../payment/payment.module';
import { ReservationModule } from '../reservation/reservation.module';
import { RoomsModule } from '../rooms/room.module';
import { UserModule } from '../user/user.module';
import { BuildCartItemService } from './applications/services/build-cart-item.service';
import { ResolveCartService } from './applications/services/resolve-cart.service';
import { AddCartItemUseCase } from './applications/useCase/add-cart-item.usecase';
import { CheckoutCartUseCase } from './applications/useCase/checkout-cart.usecase';
import { CompleteCartCheckoutUseCase } from './applications/useCase/complete-cart-checkout.usecase';
import { ClearCartUseCase } from './applications/useCase/clear-cart.usecase';
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
    RoomsModule,
    UserModule,
    ReservationModule,
    forwardRef(() => PaymentModule),
  ],
  controllers: [CartController],
  providers: [
    CartRepository,
    {
      provide: CART_REPOSITORY,
      useClass: CartRepository,
    },
    CalculateStayAmountService,
    ResolveCartService,
    BuildCartItemService,
    GetCartUseCase,
    AddCartItemUseCase,
    UpdateCartItemUseCase,
    RemoveCartItemUseCase,
    ClearCartUseCase,
    MergeCartUseCase,
    CheckoutCartUseCase,
    CompleteCartCheckoutUseCase,
  ],
  exports: [CART_REPOSITORY],
})
export class CartModule {}
