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

export type ImportCategoryTypeRowDto = {
  name: string;
  sortOrder: number;
  isActive: boolean;
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
  propertyTypes?: ImportCategoryTypeRowDto[];
  roomTypes?: ImportCategoryTypeRowDto[];
};

export type ImportRowError = {
  entity: 'user' | 'property' | 'room' | 'propertyType' | 'roomType';
  index: number;
  field?: string;
  message: string;
};

export type ImportBatchResult = {
  created: {
    users: number;
    properties: number;
    rooms: number;
    propertyTypes: number;
    roomTypes: number;
  };
  errors: ImportRowError[];
};
