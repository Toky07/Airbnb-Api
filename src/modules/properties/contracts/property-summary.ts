/**
 * Contrat feuille : résumé d'établissement sans nested rooms.
 * Rooms importe ce fichier (pas properties/contracts/index) pour éviter
 * le cycle RoomMapper ↔ PropertyMapper (voir aussi rooms/contracts/room-summary).
 */
import type { CategorySummary } from '@src/shared/types/category-summary';
import {
  DEFAULT_CANCELLATION_POLICY,
  parseCancellationPolicy,
  type CancellationPolicy,
} from '@src/modules/reservation/contracts/cancellation-policy';

export type PropertySummary = {
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: CancellationPolicy;
  touristTaxPerGuestNight: number;
  houseRules: string;
  emergencyContact: string;
  ownerId?: number;
  propertyTypeId: number | null;
  propertyType: CategorySummary | null;
  id?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export type PropertySummarySource = {
  id?: number;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy?: unknown;
  touristTaxPerGuestNight?: number | string | null;
  houseRules?: string | null;
  emergencyContact?: string | null;
  ownerId: number;
  propertyTypeId?: number | null;
  propertyType?: { id: number; name: string; slug: string } | null;
  createdAt?: Date;
  updatedAt?: Date;
};

function mapPropertyType(
  propertyType: PropertySummarySource['propertyType'],
): CategorySummary | null {
  if (!propertyType) {
    return null;
  }
  return {
    id: propertyType.id,
    name: propertyType.name,
    slug: propertyType.slug,
  };
}

export type PropertySummaryWithOwner = PropertySummary & { ownerId: number };

/** Normalise un entity ORM / domaine Property vers PropertySummary. */
export function toPropertySummary(
  source: PropertySummarySource,
): PropertySummaryWithOwner;
export function toPropertySummary(
  source: PropertySummarySource,
  options: { omitOwnerId: true },
): PropertySummary;
export function toPropertySummary(
  source: PropertySummarySource,
  options?: { omitOwnerId?: boolean },
): PropertySummary;
export function toPropertySummary(
  source: PropertySummarySource,
  options?: { omitOwnerId?: boolean },
): PropertySummary {
  return {
    name: source.name,
    description: source.description,
    address: source.address,
    city: source.city,
    country: source.country,
    latitude: source.latitude,
    longitude: source.longitude,
    checkInTime: source.checkInTime,
    checkOutTime: source.checkOutTime,
    cancellationPolicy:
      parseCancellationPolicy(source.cancellationPolicy) ??
      DEFAULT_CANCELLATION_POLICY,
    touristTaxPerGuestNight: Number(source.touristTaxPerGuestNight ?? 0),
    houseRules: String(source.houseRules ?? '').trim(),
    emergencyContact: String(source.emergencyContact ?? '').trim(),
    ...(options?.omitOwnerId ? {} : { ownerId: source.ownerId }),
    propertyTypeId: source.propertyTypeId ?? null,
    propertyType: mapPropertyType(source.propertyType),
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
    id: source.id,
  };
}
