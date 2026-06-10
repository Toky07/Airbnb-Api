export interface IPropertyAmenityRepository {
  findAmenityIdsByPropertyId(propertyId: number): Promise<number[]>;
  replaceForProperty(propertyId: number, amenityIds: number[]): Promise<void>;
}

export const PROPERTY_AMENITY_REPOSITORY = 'PROPERTY_AMENITY_REPOSITORY';
