import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateCartPaymentIntentUseCase } from '../../../payment/applications/useCase/create-cart-payment-intent.usecase';
import type { CreatePaymentIntentOutput } from '../../../payment/applications/dto/create-payment-intent.output';
import { CreateReservationUseCase } from '../../../reservation/applications/useCase/create-reservation.usecase';
import { CART_ITEM_TYPE } from '../../domain/constants/cart-item-type.constant';
import {
  ResolveCartService,
  type CartRequestContext,
} from '../services/resolve-cart.service';
import { PAYMENT_TYPE } from '../../../payment/domain/types/payment.type';
import { CreateReservationDto } from '../../../reservation/applications/dto/create-reservation.dto';

@Injectable()
export class CheckoutCartUseCase {
  constructor(
    private readonly resolveCartService: ResolveCartService,
    private readonly createReservationUseCase: CreateReservationUseCase,
    private readonly createCartPaymentIntentUseCase: CreateCartPaymentIntentUseCase,
  ) {}

  async execute(
    authId: number,
    context: CartRequestContext,
  ): Promise<CreatePaymentIntentOutput> {
    const cart = await this.resolveCartService.resolve({
      ...context,
      authId,
    });

    if (!cart.id || cart.items.length === 0) {
      throw new BadRequestException('Votre panier est vide.');
    }

    if (!cart.userId) {
      throw new UnauthorizedException('Connexion requise pour payer.');
    }

    const items: CreateReservationDto[] = [];
    for (const item of cart.items) {
      if (item.itemType === CART_ITEM_TYPE.RESERVATION) {
        items.push({
          roomId: item.roomId!,
          startDate: item.startDate!,
          endDate: item.endDate!,
          guestCount: item.guestCount!,
        });
      }
    }

    const reservation = await this.createReservationUseCase.execute(authId, items);
    const amountInCents = Math.round(cart.totalPrice * 100);

    return await this.createCartPaymentIntentUseCase.execute({
      authId,
      cartId: cart.id,
      amountInCents,
      propertyType: PAYMENT_TYPE.RESERVATION,
      propertyId: reservation.id,
    });
  }
}
