import type { SelectQueryBuilder } from 'typeorm';
import type { PaginationParams } from '../../../../shared/pagination/pagination.types';
import { RoomEntity } from '../entities/room.entity';

const EARTH_RADIUS_KM = 6371;

export function applyRoomListFilters(
  qb: SelectQueryBuilder<RoomEntity>,
  params: PaginationParams,
): void {
  if (params.propertyId) {
    qb.andWhere('room.propertyId = :propertyId', {
      propertyId: params.propertyId,
    });
  }

  if (params.search) {
    const term = `%${params.search}%`;
    qb.andWhere(
      '(room.name LIKE :term OR room.description LIKE :term OR property.name LIKE :term OR property.city LIKE :term)',
      { term },
    );
  }

  if (params.city) {
    qb.andWhere('property.city ILIKE :city', {
      city: `%${params.city}%`,
    });
  }

  if (params.minPrice !== undefined) {
    qb.andWhere('room.pricePerNight >= :minPrice', {
      minPrice: params.minPrice,
    });
  }

  if (params.maxPrice !== undefined) {
    qb.andWhere('room.pricePerNight <= :maxPrice', {
      maxPrice: params.maxPrice,
    });
  }

  if (params.minGuests !== undefined) {
    qb.andWhere('room.maxGuests >= :minGuests', {
      minGuests: params.minGuests,
    });
  }

  if (params.roomTypeId !== undefined) {
    qb.andWhere('room.roomTypeId = :roomTypeId', {
      roomTypeId: params.roomTypeId,
    });
  }

  if (params.status) {
    qb.andWhere('room.status = :status', { status: params.status });
  }

  if (params.amenityIds && params.amenityIds.length > 0) {
    params.amenityIds.forEach((amenityId, index) => {
      qb.andWhere(
        `EXISTS (
          SELECT 1 FROM room_amenities ra${index}
          WHERE ra${index}."roomId" = room.id
            AND ra${index}."amenityId" = :amenityId${index}
        )`,
        { [`amenityId${index}`]: amenityId },
      );
    });
  }

  if (params.lat !== undefined && params.lng !== undefined && params.radiusKm) {
    const latDelta = params.radiusKm / 111;
    const lngDelta =
      params.radiusKm /
      (111 * Math.max(Math.cos((params.lat * Math.PI) / 180), 0.01));

    qb.andWhere(
      'property.latitude IS NOT NULL AND property.longitude IS NOT NULL',
    );
    qb.andWhere('property.latitude BETWEEN :minLat AND :maxLat', {
      minLat: params.lat - latDelta,
      maxLat: params.lat + latDelta,
    });
    qb.andWhere('property.longitude BETWEEN :minLng AND :maxLng', {
      minLng: params.lng - lngDelta,
      maxLng: params.lng + lngDelta,
    });
  }
}

export { EARTH_RADIUS_KM };
