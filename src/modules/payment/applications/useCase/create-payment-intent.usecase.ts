import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CalculateStayAmountService } from '../../../../shared/pricing/calculate-stay-amount.service';
import {
  RESERVATION_REPOSITORY,
  type IReservationRepository,
} from '../../../reservation/domain/repositories/reservation.repository';
import { RESERVATION_STATUS } from '../../../reservation/domain/constants/reservation-status.constant';
import {
  ROOM_REPOSITORY,
  type IRoomRepository,
} from '../../../rooms/domain/repositories/room.repository';
import { USER_REPOSITORY } from '../../../user/infrastructure/repositories/user.repository';
import type { IUserRepository } from '../../../user/domain/repositories/user.repository';
import { PAYMENT_PROVIDER } from '../../domain/constants/payment-provider.constant';
import { PAYMENT_STATUS } from '../../domain/constants/payment-status.constant';
import { Payment } from '../../domain/entities/payment.entity';
import {
  PAYMENT_GATEWAY,
  type IPaymentGateway,
} from '../../domain/ports/payment-gateway.port';
import {
  PAYMENT_REPOSITORY,
  type IPaymentRepository,
} from '../../domain/repositories/payment.repository';
import { CreatePaymentIntentOutput } from '../dto/create-payment-intent.output';
import type { CreatePaymentIntentDto } from '../dto/create-payment-intent.dto';
import {
  getStripeCurrency,
  getStripePublishableKey,
} from '../../infrastructure/stripe/stripe.config';
import { PAYMENT_TYPE } from '../../domain/types/payment.type';

type PaymentIntentContext = {
  userId: number;
  propertyType: (typeof PAYMENT_TYPE)[keyof typeof PAYMENT_TYPE];
  propertyId: number;
  amountInCents: number;
  metadata: Record<string, string>;
  cartId: number | null;
};

@Injectable()
export class CreatePaymentIntentUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(PAYMENT_GATEWAY)
    private readonly paymentGateway: IPaymentGateway,
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: IReservationRepository,
    private readonly calculateStayAmount: CalculateStayAmountService,
  ) {}

  async execute(
    authId: number,
    dto: CreatePaymentIntentDto,
  ): Promise<CreatePaymentIntentOutput> {
    const user = await this.userRepository.findByAuthId(authId);
    if (!user?.id) {
      throw new UnauthorizedException('Utilisateur introuvable.');
    }

    const context = dto.reservationId
      ? await this.buildContextFromReservation(dto.reservationId, user.id)
      : await this.buildContextFromDto(dto, user.id);

    const currency = getStripeCurrency();

    const paymentIntent = await this.paymentGateway.createPaymentIntent({
      amount: context.amountInCents,
      currency,
      metadata: { ...context.metadata },
    });

    if (!paymentIntent.clientSecret) {
      throw new BadRequestException(
        'Impossible de créer le paiement Stripe.',
      );
    }

    const payment = await this.paymentRepository.create(
      new Payment(
        context.amountInCents,
        currency,
        PAYMENT_STATUS.PENDING,
        PAYMENT_PROVIDER.STRIPE,
        paymentIntent.id,
        context.userId,
        context.propertyType,
        context.propertyId,
      ),
    );

    return new CreatePaymentIntentOutput(
      payment.id!,
      paymentIntent.clientSecret,
      context.amountInCents,
      currency,
      getStripePublishableKey(),
    );
  }

  private async buildContextFromReservation(
    reservationId: number,
    userId: number,
  ): Promise<PaymentIntentContext> {
    const reservation = await this.reservationRepository.findById(reservationId);

    if (!reservation?.id) {
      throw new NotFoundException('Réservation introuvable.');
    }

    if (reservation.userId !== userId) {
      throw new UnauthorizedException('Accès refusé.');
    }

    const pendingItems = reservation.items;

    if (pendingItems.length === 0) {
      throw new BadRequestException(
        'Seules les réservations en attente peuvent être payées.',
      );
    }

    return {
      userId: reservation.userId,
      amountInCents: 0,
      propertyType: PAYMENT_TYPE.RESERVATION,
      propertyId: reservation.id,
      metadata: {},
      cartId: null,
    };
  }

  private async buildContextFromDto(
    dto: CreatePaymentIntentDto,
    userId: number,
  ): Promise<PaymentIntentContext> {
    if (!dto.roomId || !dto.checkIn || !dto.checkOut || !dto.guestCount) {
      throw new BadRequestException(
        'roomId, checkIn, checkOut et guestCount sont requis sans reservationId.',
      );
    }

    const room = await this.roomRepository.findById(dto.roomId);
    if (!room?.id) {
      throw new NotFoundException('Chambre introuvable.');
    }

    if (room.status !== 'available') {
      throw new BadRequestException('Cette chambre n’est pas disponible.');
    }

    if (dto.guestCount > room.maxGuests) {
      throw new BadRequestException(
        `Cette chambre accepte au maximum ${room.maxGuests} voyageurs.`,
      );
    }

    const stayAmount = this.calculateStayAmount.execute({
      checkIn: dto.checkIn,
      checkOut: dto.checkOut,
      pricePerNight: room.pricePerNight,
    });

    return {
      userId,
      amountInCents: stayAmount.amountInCents,
      propertyType: PAYMENT_TYPE.RESERVATION,
      propertyId: room.id,
      metadata: {},
      cartId: null,
    };
  }
}
