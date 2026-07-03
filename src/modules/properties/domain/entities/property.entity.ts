import { CreatePropertyDto } from '../../applications/dto/createProperty.dto';
import type { CategorySummary } from '../../../../shared/types/category-summary';
import { Room } from '../../../rooms/domain/entities/room.entity';

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
    this.ownerId = ownerId;
    this.propertyTypeId = propertyTypeId ?? null;
    this.propertyType = propertyType ?? null;
    this.rooms = rooms || [];
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
