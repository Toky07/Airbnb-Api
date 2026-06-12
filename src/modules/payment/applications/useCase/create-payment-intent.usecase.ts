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

type PaymentIntentContext = {
  roomId: number;
  userId: number;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  amountInCents: number;
  nights: number;
  pricePerNight: number;
  reservationId: number | null;
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
      metadata: {
        roomId: String(context.roomId),
        userId: String(context.userId),
        checkIn: context.checkIn,
        checkOut: context.checkOut,
        guestCount: String(context.guestCount),
        ...(context.reservationId
          ? { reservationId: String(context.reservationId) }
          : {}),
      },
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
        context.roomId,
        context.checkIn,
        context.checkOut,
        context.guestCount,
        context.nights,
        context.reservationId,
      ),
    );

    return new CreatePaymentIntentOutput(
      payment.id!,
      paymentIntent.clientSecret,
      context.amountInCents,
      currency,
      getStripePublishableKey(),
      context.nights,
      context.pricePerNight,
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

    const pendingItems = reservation.items.filter(
      (item) => item.status === RESERVATION_STATUS.PENDING,
    );

    if (pendingItems.length === 0) {
      throw new BadRequestException(
        'Seules les réservations en attente peuvent être payées.',
      );
    }

    const firstItem = pendingItems[0]!;

    const room = await this.roomRepository.findById(firstItem.roomId);
    if (!room?.id) {
      throw new NotFoundException('Chambre introuvable.');
    }

    const stayAmount = this.calculateStayAmount.execute({
      checkIn: firstItem.checkIn,
      checkOut: firstItem.checkOut,
      pricePerNight: room.pricePerNight,
    });

    if (stayAmount.amountInMajorUnit !== firstItem.price) {
      throw new BadRequestException('Le montant de la réservation est invalide.');
    }

    return {
      roomId: firstItem.roomId,
      userId: reservation.userId,
      checkIn: firstItem.checkIn,
      checkOut: firstItem.checkOut,
      guestCount: firstItem.guestCount,
      amountInCents: stayAmount.amountInCents,
      nights: firstItem.nights,
      pricePerNight: room.pricePerNight,
      reservationId: reservation.id,
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
      roomId: room.id,
      userId,
      checkIn: dto.checkIn,
      checkOut: dto.checkOut,
      guestCount: dto.guestCount,
      amountInCents: stayAmount.amountInCents,
      nights: stayAmount.nights,
      pricePerNight: room.pricePerNight,
      reservationId: null,
    };
  }
}
