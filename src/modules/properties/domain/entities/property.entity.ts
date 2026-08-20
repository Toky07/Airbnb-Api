import { CreatePropertyDto } from '@src/modules/properties/applications/dto/createProperty.dto';
import type { CategorySummary } from '@src/shared/types/category-summary';
import type { CancellationPolicy } from '@src/modules/reservation/contracts/cancellation-policy';
import { DEFAULT_CANCELLATION_POLICY } from '@src/modules/reservation/contracts/cancellation-policy';
import type { Room } from '@src/modules/rooms/domain/entities/room.entity';
import {
  EMPTY_PROPERTY_ARRIVAL_GUIDE,
  parseArrivalGuide,
} from '@src/modules/properties/domain/constants/property-arrival-guide';

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
  public houseRules: string;
  public checkInInstructions: string;
  public wifiName: string;
  public wifiPassword: string;
  public emergencyContact: string;
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
    houseRules,
    checkInInstructions,
    wifiName,
    wifiPassword,
    emergencyContact,
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
    const arrival = parseArrivalGuide({
      houseRules: houseRules ?? EMPTY_PROPERTY_ARRIVAL_GUIDE.houseRules,
      checkInInstructions:
        checkInInstructions ?? EMPTY_PROPERTY_ARRIVAL_GUIDE.checkInInstructions,
      wifiName: wifiName ?? EMPTY_PROPERTY_ARRIVAL_GUIDE.wifiName,
      wifiPassword: wifiPassword ?? EMPTY_PROPERTY_ARRIVAL_GUIDE.wifiPassword,
      emergencyContact:
        emergencyContact ?? EMPTY_PROPERTY_ARRIVAL_GUIDE.emergencyContact,
    });
    this.houseRules = arrival.houseRules;
    this.checkInInstructions = arrival.checkInInstructions;
    this.wifiName = arrival.wifiName;
    this.wifiPassword = arrival.wifiPassword;
    this.emergencyContact = arrival.emergencyContact;
    this.ownerId = ownerId;
    this.propertyTypeId = propertyTypeId ?? null;
    this.propertyType = propertyType ?? null;
    this.rooms = rooms || [];
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
