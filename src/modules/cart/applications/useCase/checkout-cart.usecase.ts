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
import { PAYMENT_TYPE } from 'src/modules/payment/domain/types/payment.type';

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

    const reservationIds: number[] = [];
    let totalNights = 0;
    let summaryRoomId = 0;
    let summaryCheckIn = 'cart-checkout';
    let summaryCheckOut = 'cart-checkout';
    let summaryGuestCount = 0;
    let summaryPricePerNight = 0;

    for (const item of cart.items) {
      if (item.itemType === CART_ITEM_TYPE.RESERVATION) {
        const reservation = await this.createReservationUseCase.execute(authId, {
          roomId: item.roomId!,
          startDate: item.startDate!,
          endDate: item.endDate!,
          guestCount: item.guestCount!,
        });

        reservationIds.push(reservation.id);
        totalNights += reservation.nights;

        if (reservationIds.length === 1) {
          summaryRoomId = item.roomId!;
          summaryCheckIn = item.startDate!;
          summaryCheckOut = item.endDate!;
          summaryGuestCount = item.guestCount!;
          summaryPricePerNight = item.unitPrice;
        }
      }
    }

    const amountInCents = Math.round(cart.totalPrice * 100);

    return this.createCartPaymentIntentUseCase.execute({
      authId,
      cartId: cart.id,
      reservationIds,
      amountInCents,
      propertyType: PAYMENT_TYPE.RESERVATION,
      propertyId: reservationIds[0]!,
    });
  }
}
