import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { IPropertyRepository } from '../../../../properties/domain/repositories/property.repository';
import type { IPaymentRepository } from '../../../../payment/domain/repositories/payment.repository';
import type { IUserRepository } from '../../../../user/domain/repositories/user.repository';
import { BookingOrderDetailOutput } from '../../dto/booking-order.output';
import type { BookingOrderItemOutput } from '../../dto/booking-order-item.output';
import type { ResolvePaymentReservationsService } from '../../services/resolve-payment-reservations.service';
import { filterItemsByPropertyIds } from '../../services/scope-booking-order-items.service';
import type { GetBookingOrderQuery } from '../queries/GetBookingOrderQuery';

export class GetBookingOrderQueryHandler implements IQueryHandler<
  GetBookingOrderQuery,
  BookingOrderDetailOutput
> {
  constructor(
    private readonly paymentRepository: IPaymentRepository,
    private readonly userRepository: IUserRepository,
    private readonly propertyRepository: IPropertyRepository,
    private readonly resolvePaymentReservations: ResolvePaymentReservationsService,
  ) {}

  async execute(
    query: GetBookingOrderQuery,
  ): Promise<BookingOrderDetailOutput> {
    if (!Number.isFinite(query.paymentId) || query.paymentId <= 0) {
      throw new NotFoundException('Réservation introuvable.');
    }

    const payment = await this.paymentRepository.findById(query.paymentId);
    if (!payment?.id) {
      throw new NotFoundException('Réservation introuvable.');
    }

    const allItems =
      await this.resolvePaymentReservations.resolveBookingItemsForPayment(
        payment,
      );

    if (!query.access.canReadAll) {
      await this.assertHostAccess(query.access, allItems);
    }

    const hostPropertyIds = query.access.canReadAll
      ? []
      : await this.loadHostPropertyIds(query.access.authId);
    const items = filterItemsByPropertyIds(allItems, hostPropertyIds);

    const customer = await this.userRepository.findById(payment.userId);

    return BookingOrderDetailOutput.fromParts(payment, items, customer);
  }

  private async loadHostPropertyIds(authId: number): Promise<number[]> {
    const user = await this.userRepository.findByAuthId(authId);
    if (!user?.id) {
      return [];
    }

    const properties = await this.propertyRepository.findAllByOwnerId(user.id);
    return properties
      .map((property) => property.id)
      .filter((id): id is number => typeof id === 'number' && id > 0);
  }

  private async assertHostAccess(
    access: GetBookingOrderQuery['access'],
    items: BookingOrderItemOutput[],
  ): Promise<void> {
    if (!access.canReadHost) {
      throw new ForbiddenException('Accès refusé.');
    }

    const propertyIds = await this.loadHostPropertyIds(access.authId);
    if (propertyIds.length === 0) {
      throw new ForbiddenException('Accès refusé.');
    }

    const allowedPropertyIds = new Set(propertyIds);
    const hasAllowedItem = items.some(
      (item) =>
        item.propertyId != null && allowedPropertyIds.has(item.propertyId),
    );

    if (!hasAllowedItem) {
      throw new ForbiddenException('Accès refusé.');
    }
  }
}
