import type { CategorySummary } from '../../../../shared/types/category-summary';
import type { CancellationPolicy } from '../../../reservation/contracts/cancellation-policy';
import {
  toRoomSummary,
  type RoomSummary,
} from '../../../rooms/contracts/room-summary';
import { Property } from '../../domain/entities/property.entity';

export class PropertyOutput {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public address: string,
    public city: string,
    public country: string,
    public latitude: number,
    public longitude: number,
    public checkInTime: string,
    public checkOutTime: string,
    public cancellationPolicy: CancellationPolicy,
    public touristTaxPerGuestNight: number,
    public ownerId: number,
    public propertyTypeId: number | null,
    public propertyType: CategorySummary | null,
    public rooms: RoomSummary[],
    public createdAt: Date,
    public updatedAt: Date,
    public image: string | null,
  ) {}

  static fromDomain(
    property: Property,
    image: string | null = null,
    rooms?: RoomSummary[],
  ): PropertyOutput {
    return new PropertyOutput(
      property.id!,
      property.name,
      property.description,
      property.address,
      property.city,
      property.country,
      property.latitude,
      property.longitude,
      property.checkInTime,
      property.checkOutTime,
      property.cancellationPolicy,
      property.touristTaxPerGuestNight,
      property.ownerId,
      property.propertyTypeId,
      property.propertyType,
      rooms ?? property.rooms.map((room) => toRoomSummary(room)),
      property.createdAt!,
      property.updatedAt!,
      image,
    );
  }
}
