import type { CancellationPolicy } from '../../../reservation/domain/constants/cancellation-policy.constant';

export type CreatePropertyDto = {
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy?: CancellationPolicy;
  ownerId: number;
  propertyTypeId?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
  id?: number;
};
