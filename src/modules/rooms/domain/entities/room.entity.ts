import { Property } from '../../../properties/domain/entities/property.entity';
import type { CategorySummary } from '../../../../shared/types/category-summary';

export class Room {
  public name: string;
  public slug: string;
  public description: string;
  public pricePerNight: number;
  public weekendPricePerNight: number | null;
  public maxGuests: number;
  public bedrooms: number;
  public bathrooms: number;
  public beds: number;
  public quantity: number;
  public size: number;
  public status: string;
  public property: Property;
  public roomTypeId: number | null;
  public roomType: CategorySummary | null;
  public createdAt?: Date;
  public updatedAt?: Date;
  public id?: number;

  constructor({
    name,
    slug,
    description,
    pricePerNight,
    weekendPricePerNight,
    maxGuests,
    bedrooms,
    bathrooms,
    beds,
    quantity,
    size,
    status,
    property,
    roomTypeId,
    roomType,
    createdAt,
    updatedAt,
    id,
  }: {
    name: string;
    slug?: string;
    description: string;
    pricePerNight: number;
    weekendPricePerNight?: number | null;
    maxGuests: number;
    bedrooms: number;
    bathrooms: number;
    beds: number;
    quantity: number;
    size: number;
    status: string;
    property: Property;
    roomTypeId?: number | null;
    roomType?: CategorySummary | null;
    createdAt?: Date;
    updatedAt?: Date;
    id?: number;
  }) {
    this.name = name;
    this.slug = slug ?? '';
    this.description = description;
    this.pricePerNight = pricePerNight;
    this.weekendPricePerNight = weekendPricePerNight ?? null;
    this.maxGuests = maxGuests;
    this.bedrooms = bedrooms;
    this.bathrooms = bathrooms;
    this.beds = beds;
    this.quantity = quantity;
    this.size = size;
    this.status = status;
    this.property = property;
    this.roomTypeId = roomTypeId ?? null;
    this.roomType = roomType ?? null;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.id = id;
  }
}
