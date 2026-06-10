import type { AmenityScope } from '../../domain/constants/amenity-scope.constant';

export type CreateAmenityDto = {
  name: string;
  icon: string;
  scope: AmenityScope;
  isActive?: boolean;
};

export type UpdateAmenityDto = {
  name?: string;
  icon?: string;
  isActive?: boolean;
};

export type SyncAmenitiesDto = {
  amenityIds: number[];
};
