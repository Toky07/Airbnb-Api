import { toPropertySummary } from '@src/modules/properties/contracts/property-summary';
import { toRoomDomain } from '@src/modules/rooms/contracts/room-summary';
import { Property } from '@src/modules/properties/domain/entities/property.entity';
import { PropertyEntity } from '@src/modules/properties/infrastructure/entities/property-entity.entity';

export class PropertyMapper {
  static toDomain(property: PropertyEntity): Property {
    const domain = new Property({
      ...toPropertySummary(property),
      checkInInstructions: property.checkInInstructions ?? '',
      wifiName: property.wifiName ?? '',
      wifiPassword: property.wifiPassword ?? '',
      rooms: [],
    });
    domain.rooms =
      property.rooms?.map((room) => toRoomDomain(room, domain)) || [];
    return domain;
  }

  /** Évite la récursion Property ↔ Room lors du mapping inverse. */
  static toDomainWithoutRooms(property: PropertyEntity): Property {
    return new Property({
      ...toPropertySummary(property),
      checkInInstructions: property.checkInInstructions ?? '',
      wifiName: property.wifiName ?? '',
      wifiPassword: property.wifiPassword ?? '',
      rooms: [],
    });
  }

  static toEntity(property: Property): Partial<PropertyEntity> {
    return {
      id: property.id,
      name: property.name,
      description: property.description,
      address: property.address,
      city: property.city,
      country: property.country,
      latitude: property.latitude,
      longitude: property.longitude,
      checkInTime: property.checkInTime,
      checkOutTime: property.checkOutTime,
      cancellationPolicy: property.cancellationPolicy,
      touristTaxPerGuestNight: property.touristTaxPerGuestNight,
      houseRules: property.houseRules,
      checkInInstructions: property.checkInInstructions,
      wifiName: property.wifiName,
      wifiPassword: property.wifiPassword,
      emergencyContact: property.emergencyContact,
      ownerId: property.ownerId,
      propertyTypeId: property.propertyTypeId,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
    };
  }
}
