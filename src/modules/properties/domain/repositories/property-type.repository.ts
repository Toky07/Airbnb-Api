import type { PropertyType } from '@src/modules/properties/domain/entities/property-type.entity';

export interface IPropertyTypeRepository {
  findAll(): Promise<PropertyType[]>;
  findActive(): Promise<PropertyType[]>;
  findById(id: number): Promise<PropertyType | null>;
  findBySlug(slug: string): Promise<PropertyType | null>;
  create(type: PropertyType): Promise<PropertyType>;
  update(type: PropertyType): Promise<PropertyType>;
  delete(id: number): Promise<boolean>;
  countUsages(id: number): Promise<number>;
}

export const PROPERTY_TYPE_REPOSITORY = 'PROPERTY_TYPE_REPOSITORY';
