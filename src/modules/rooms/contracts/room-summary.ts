/**
 * Contrat feuille : résumé chambre sans nested property / RoomOutput.
 * Properties importe ce fichier (pas rooms/contracts/index) pour éviter
 * PropertyMapper → RoomMapper et PropertyOutput → RoomOutput.
 */
import type { CategorySummary } from '../../../shared/types/category-summary';
import type { Property } from '../../properties/domain/entities/property.entity';
import { Room } from '../domain/entities/room.entity';

export type RoomSummary = {
  id: number;
  name: string;
  slug: string;
  description: string;
  pricePerNight: number;
  weekendPricePerNight: number | null;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  beds: number;
  quantity: number;
  size: number;
  status: string;
  roomTypeId: number | null;
  roomType: CategorySummary | null;
  createdAt: Date;
  updatedAt: Date;
  images: string[];
};

export type RoomSummarySource = {
  id?: number;
  name: string;
  slug?: string | null;
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
  roomTypeId?: number | null;
  roomType?: { id: number; name: string; slug: string } | null;
  createdAt?: Date;
  updatedAt?: Date;
};

function mapRoomType(
  roomType: RoomSummarySource['roomType'],
): CategorySummary | null {
  if (!roomType) {
    return null;
  }
  return {
    id: roomType.id,
    name: roomType.name,
    slug: roomType.slug,
  };
}

/** Normalise un entity ORM / domaine Room vers RoomSummary (sans property). */
export function toRoomSummary(
  source: RoomSummarySource,
  images: string[] = [],
): RoomSummary {
  return {
    id: source.id!,
    name: source.name,
    slug: source.slug ?? '',
    description: source.description,
    pricePerNight: source.pricePerNight,
    weekendPricePerNight: source.weekendPricePerNight ?? null,
    maxGuests: source.maxGuests,
    bedrooms: source.bedrooms,
    bathrooms: source.bathrooms,
    beds: source.beds,
    quantity: source.quantity,
    size: source.size,
    status: source.status,
    roomTypeId: source.roomTypeId ?? null,
    roomType: mapRoomType(source.roomType),
    createdAt: source.createdAt!,
    updatedAt: source.updatedAt!,
    images,
  };
}

/** Mappe une chambre ORM vers le domaine, sans passer par RoomMapper. */
export function toRoomDomain(
  source: RoomSummarySource,
  property: Property,
): Room {
  return new Room({
    name: source.name,
    slug: source.slug ?? '',
    description: source.description,
    pricePerNight: source.pricePerNight,
    weekendPricePerNight: source.weekendPricePerNight ?? null,
    maxGuests: source.maxGuests,
    bedrooms: source.bedrooms,
    bathrooms: source.bathrooms,
    beds: source.beds,
    quantity: source.quantity,
    size: source.size,
    status: source.status,
    property,
    roomTypeId: source.roomTypeId ?? null,
    roomType: mapRoomType(source.roomType),
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
    id: source.id,
  });
}
