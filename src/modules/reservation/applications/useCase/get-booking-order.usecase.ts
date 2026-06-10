import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  PROPERTY_REPOSITORY,
} from '../../../properties/infrastructure/repositories/property.repository';
import type { IPropertyRepository } from '../../../properties/domain/repositories/property.repository';
import {
  PAYMENT_REPOSITORY,
  type IPaymentRepository,
} from '../../../payment/domain/repositories/payment.repository';
import { USER_REPOSITORY } from '../../../user/infrastructure/repositories/user.repository';
import type { IUserRepository } from '../../../user/domain/repositories/user.repository';
import {
  RESERVATION_REPOSITORY,
  type IReservationRepository,
} from '../../domain/repositories/reservation.repository';
import { BookingOrderDetailOutput } from '../dto/booking-order.output';
import { ResolvePaymentReservationsService } from '../services/resolve-payment-reservations.service';

export type GetBookingOrderAccess = {
  authId: number;
  canReadAll: boolean;
  canReadHost: boolean;
};

@Injectable()
export class GetBookingOrderUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: IReservationRepository,
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: IPropertyRepository,
    private readonly resolvePaymentReservations: ResolvePaymentReservationsService,
  ) {}

  async execute(
    paymentId: number,
    access: GetBookingOrderAccess,
  ): Promise<BookingOrderDetailOutput> {
    if (!Number.isFinite(paymentId) || paymentId <= 0) {
      throw new NotFoundException('Réservation introuvable.');
    }

    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment?.id) {
      throw new NotFoundException('Réservation introuvable.');
    }

    const items = await this.resolvePaymentReservations.resolveForPayment(payment);

    if (!access.canReadAll) {
      await this.assertHostAccess(access, items);
    }

    const customer = await this.userRepository.findById(payment.userId);

    return BookingOrderDetailOutput.fromParts(payment, items, customer);
  }

  private async assertHostAccess(
    access: GetBookingOrderAccess,
    items: import('../dto/reservation.output').ReservationOutput[],
  ): Promise<void> {
    if (!access.canReadHost) {
      throw new ForbiddenException('Accès refusé.');
    }

    const user = await this.userRepository.findByAuthId(access.authId);
    if (!user?.id) {
      throw new ForbiddenException('Accès refusé.');
    }

    const property = await this.propertyRepository.findByOwnerId(user.id);
    if (!property?.id) {
      throw new ForbiddenException('Accès refusé.');
    }

    const allowedReservationIds = new Set(
      await this.reservationRepository.findIdsByPropertyId(property.id),
    );

    const hasAllowedItem = items.some((item) => allowedReservationIds.has(item.id));
    if (!hasAllowedItem) {
      throw new ForbiddenException('Accès refusé.');
    }
  }
}
