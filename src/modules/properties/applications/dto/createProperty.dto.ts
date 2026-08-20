import type { CancellationPolicy } from '@src/modules/reservation/contracts/cancellation-policy';

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
  touristTaxPerGuestNight?: number;
  houseRules?: string;
  checkInInstructions?: string;
  wifiName?: string;
  wifiPassword?: string;
  emergencyContact?: string;
  ownerId: number;
  propertyTypeId?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
  id?: number;
};
