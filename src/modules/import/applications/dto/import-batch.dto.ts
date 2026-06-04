export type ImportUserRowDto = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  avatarUrl?: string;
};

export type ImportPropertyRowDto = {
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  checkInTime: string;
  checkOutTime: string;
  ownerEmail: string;
  imageUrl?: string;
};

export type ImportRoomRowDto = {
  name: string;
  description: string;
  pricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  beds: number;
  quantity: number;
  size: number;
  status: string;
  propertyName: string;
  imageUrls?: string;
};

export type ImportBatchDto = {
  users?: ImportUserRowDto[];
  properties?: ImportPropertyRowDto[];
  rooms?: ImportRoomRowDto[];
};

export type ImportRowError = {
  entity: 'user' | 'property' | 'room';
  index: number;
  field?: string;
  message: string;
};

export type ImportBatchResult = {
  created: { users: number; properties: number; rooms: number };
  errors: ImportRowError[];
};
