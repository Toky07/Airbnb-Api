import type { CreateRoomDto } from '../../applications/dto/createRoom.dto';
import { Property } from '../../../properties/domain/entities/property.entity';

export function parseRoomBody(body: Record<string, unknown>): CreateRoomDto {
  const rawProperty =
    typeof body.property === 'string'
      ? JSON.parse(body.property)
      : body.property;

  const property =
    rawProperty instanceof Property
      ? rawProperty
      : new Property({
          name: String((rawProperty as Property)?.name ?? ''),
          description: String((rawProperty as Property)?.description ?? ''),
          address: String((rawProperty as Property)?.address ?? ''),
          city: String((rawProperty as Property)?.city ?? ''),
          country: String((rawProperty as Property)?.country ?? ''),
          latitude: Number((rawProperty as Property)?.latitude ?? 0),
          longitude: Number((rawProperty as Property)?.longitude ?? 0),
          checkInTime: String((rawProperty as Property)?.checkInTime ?? ''),
          checkOutTime: String((rawProperty as Property)?.checkOutTime ?? ''),
          ownerId: Number((rawProperty as Property)?.ownerId ?? 0),
          id: (rawProperty as Property)?.id,
        });

  return {
    name: String(body.name),
    description: String(body.description),
    pricePerNight: Number(body.pricePerNight),
    weekendPricePerNight:
      body.weekendPricePerNight === undefined || body.weekendPricePerNight === ''
        ? null
        : Number(body.weekendPricePerNight),
    maxGuests: Number(body.maxGuests),
    bedrooms: Number(body.bedrooms),
    bathrooms: Number(body.bathrooms),
    beds: Number(body.beds),
    quantity: Number(body.quantity),
    size: Number(body.size),
    status: String(body.status),
    property,
    roomTypeId:
      body.roomTypeId === undefined || body.roomTypeId === ''
        ? null
        : Number(body.roomTypeId),
  };
}
