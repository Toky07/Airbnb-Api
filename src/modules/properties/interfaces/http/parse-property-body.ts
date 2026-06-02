import type { CreatePropertyDto } from '../../applications/dto/createProperty.dto';

export function parsePropertyBody(
  body: Record<string, unknown>,
): CreatePropertyDto {
  return {
    name: String(body.name),
    description: String(body.description),
    address: String(body.address),
    city: String(body.city),
    country: String(body.country),
    latitude: Number(body.latitude),
    longitude: Number(body.longitude),
    checkInTime: String(body.checkInTime),
    checkOutTime: String(body.checkOutTime),
    ownerId: Number(body.ownerId),
  };
}
