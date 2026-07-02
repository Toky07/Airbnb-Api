import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { IPropertyRepository } from '../../../../properties/domain/repositories/property.repository';
import type { IPaymentRepository } from '../../../../payment/domain/repositories/payment.repository';
import type { IUserRepository } from '../../../../user/domain/repositories/user.repository';
import type { IReservationRepository } from '../../../domain/repositories/reservation.repository';
import { BookingOrderDetailOutput } from '../../dto/booking-order.output';
import type { ReservationItemOutput } from '../../dto/reservation-item.output';
import type { ResolvePaymentReservationsService } from '../../services/resolve-payment-reservations.service';
import type { GetBookingOrderQuery } from '../queries/GetBookingOrderQuery';

export class GetBookingOrderQueryHandler
  implements IQueryHandler<GetBookingOrderQuery, BookingOrderDetailOutput>
{
  constructor(
    private readonly paymentRepository: IPaymentRepository,
    private readonly userRepository: IUserRepository,
    private readonly reservationRepository: IReservationRepository,
    private readonly propertyRepository: IPropertyRepository,
    private readonly resolvePaymentReservations: ResolvePaymentReservationsService,
  ) {}

  async execute(query: GetBookingOrderQuery): Promise<BookingOrderDetailOutput> {
    if (!Number.isFinite(query.paymentId) || query.paymentId <= 0) {
      throw new NotFoundException('Réservation introuvable.');
    }

    const payment = await this.paymentRepository.findById(query.paymentId);
    if (!payment?.id) {
      throw new NotFoundException('Réservation introuvable.');
    }

    const items =
      await this.resolvePaymentReservations.resolveForPayment(payment);

    if (!query.access.canReadAll) {
      await this.assertHostAccess(query.access, items);
    }

    const customer = await this.userRepository.findById(payment.userId);

    return BookingOrderDetailOutput.fromParts(payment, items, customer);
  }

  private async assertHostAccess(
    access: GetBookingOrderQuery['access'],
    items: ReservationItemOutput[],
  ): Promise<void> {
    if (!access.canReadHost) {
      throw new ForbiddenException('Accès refusé.');
    }

    const user = await this.userRepository.findByAuthId(access.authId);
    if (!user?.id) {
      throw new ForbiddenException('Accès refusé.');
    }

    const properties = await this.propertyRepository.findAllByOwnerId(user.id);
    const propertyIds = properties
      .map((property) => property.id)
      .filter((id): id is number => typeof id === 'number' && id > 0);

    if (propertyIds.length === 0) {
      throw new ForbiddenException('Accès refusé.');
    }

    const allowedReservationIds = new Set(
      await this.reservationRepository.findIdsByPropertyIds(propertyIds),
    );

    const hasAllowedItem = items.some((item) =>
      allowedReservationIds.has(item.reservationId),
    );
    if (!hasAllowedItem) {
      throw new ForbiddenException('Accès refusé.');
    }
  }
}
