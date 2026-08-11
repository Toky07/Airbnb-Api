import { CreatePropertyDto } from '@src/modules/properties/applications/dto/createProperty.dto';
import type { CategorySummary } from '@src/shared/types/category-summary';
import type { CancellationPolicy } from '@src/modules/reservation/contracts/cancellation-policy';
import { DEFAULT_CANCELLATION_POLICY } from '@src/modules/reservation/contracts/cancellation-policy';
import type { Room } from '@src/modules/rooms/domain/entities/room.entity';

export class Property {
  public name: string;
  public description: string;
  public address: string;
  public city: string;
  public country: string;
  public latitude: number;
  public longitude: number;
  public checkInTime: string;
  public checkOutTime: string;
  public cancellationPolicy: CancellationPolicy;
  public touristTaxPerGuestNight: number;
  public ownerId: number;
  public propertyTypeId: number | null;
  public propertyType: CategorySummary | null;
  public rooms: Room[];
  public id?: number;
  public createdAt?: Date;
  public updatedAt?: Date;

  constructor({
    name,
    description,
    address,
    city,
    country,
    latitude,
    longitude,
    checkInTime,
    checkOutTime,
    cancellationPolicy,
    touristTaxPerGuestNight,
    ownerId,
    propertyTypeId,
    propertyType,
    id,
    rooms,
    createdAt,
    updatedAt,
  }: CreatePropertyDto & {
    id?: number;
    createdAt?: Date;
    updatedAt?: Date;
    rooms?: Room[];
    propertyType?: CategorySummary | null;
  }) {
    this.name = name;
    this.description = description;
    this.address = address;
    this.city = city;
    this.country = country;
    this.latitude = latitude;
    this.longitude = longitude;
    this.checkInTime = checkInTime;
    this.checkOutTime = checkOutTime;
    this.cancellationPolicy = cancellationPolicy ?? DEFAULT_CANCELLATION_POLICY;
    this.touristTaxPerGuestNight = touristTaxPerGuestNight ?? 0;
    this.ownerId = ownerId;
    this.propertyTypeId = propertyTypeId ?? null;
    this.propertyType = propertyType ?? null;
    this.rooms = rooms || [];
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
