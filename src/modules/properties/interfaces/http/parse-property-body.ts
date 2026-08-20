import {
  DEFAULT_CANCELLATION_POLICY,
  parseCancellationPolicy,
} from '@src/modules/reservation/contracts/cancellation-policy';
import type { CreatePropertyDto } from '@src/modules/properties/applications/dto/createProperty.dto';
import { parseArrivalGuide } from '@src/modules/properties/domain/constants/property-arrival-guide';

export function parsePropertyBody(
  body: Record<string, unknown>,
): CreatePropertyDto {
  const cancellationPolicy = parseCancellationPolicy(body.cancellationPolicy);

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
    cancellationPolicy: cancellationPolicy ?? DEFAULT_CANCELLATION_POLICY,
    touristTaxPerGuestNight:
      body.touristTaxPerGuestNight === undefined ||
      body.touristTaxPerGuestNight === ''
        ? 0
        : Number(body.touristTaxPerGuestNight),
    ...parseArrivalGuide(body),
    ownerId: Number(body.ownerId),
    propertyTypeId:
      body.propertyTypeId === undefined || body.propertyTypeId === ''
        ? null
        : Number(body.propertyTypeId),
  };
}
