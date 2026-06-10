import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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
import {
  ROOM_REPOSITORY,
  type IRoomRepository,
} from '../../../rooms/domain/repositories/room.repository';
import {
  USER_REPOSITORY,
} from '../../../user/infrastructure/repositories/user.repository';
import type { IUserRepository } from '../../../user/domain/repositories/user.repository';
import { CreatePaymentIntentOutput } from '../dto/create-payment-intent.output';
import type { CreatePaymentIntentDto } from '../dto/create-payment-intent.dto';
import { CalculateStayAmountService } from '../services/calculate-stay-amount.service';
import {
  getStripeCurrency,
  getStripePublishableKey,
} from '../../infrastructure/stripe/stripe.config';

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

    const currency = getStripeCurrency();

    const paymentIntent = await this.paymentGateway.createPaymentIntent({
      amount: stayAmount.amountInCents,
      currency,
      metadata: {
        roomId: String(room.id),
        userId: String(user.id),
        checkIn: dto.checkIn,
        checkOut: dto.checkOut,
        guestCount: String(dto.guestCount),
      },
    });

    if (!paymentIntent.clientSecret) {
      throw new BadRequestException(
        'Impossible de créer le paiement Stripe.',
      );
    }

    const payment = await this.paymentRepository.create(
      new Payment(
        stayAmount.amountInCents,
        currency,
        PAYMENT_STATUS.PENDING,
        PAYMENT_PROVIDER.STRIPE,
        paymentIntent.id,
        user.id,
        room.id,
        dto.checkIn,
        dto.checkOut,
        dto.guestCount,
        stayAmount.nights,
      ),
    );

    return new CreatePaymentIntentOutput(
      payment.id!,
      paymentIntent.clientSecret,
      stayAmount.amountInCents,
      currency,
      getStripePublishableKey(),
      stayAmount.nights,
      room.pricePerNight,
    );
  }
}
