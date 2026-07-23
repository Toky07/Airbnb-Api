import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import type { IPropertyRepository } from '../../../properties/domain/repositories/property.repository';
import { PROPERTY_REPOSITORY } from '../../../properties/infrastructure/repositories/property.repository';
import type { IRoomRepository } from '../../../rooms/domain/repositories/room.repository';
import { ROOM_REPOSITORY } from '../../../rooms/domain/repositories/room.repository';
import {
  DEFAULT_CANCELLATION_POLICY,
  type CancellationPolicy,
} from '../../domain/constants/cancellation-policy.constant';
import type { Reservation } from '../../domain/entities/reservation.entity';

@Injectable()
export class ResolveReservationCancellationPolicyService {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: IPropertyRepository,
  ) {}

  async resolve(reservation: Reservation): Promise<CancellationPolicy> {
    const item = reservation.items[0];
    if (!item?.roomId) {
      return DEFAULT_CANCELLATION_POLICY;
    }

    const room = await this.roomRepository.findById(item.roomId);
    const propertyId = room?.property?.id;
    if (!propertyId) {
      return DEFAULT_CANCELLATION_POLICY;
    }

    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      throw new NotFoundException('Établissement introuvable.');
    }

    return property.cancellationPolicy;
  }
}
