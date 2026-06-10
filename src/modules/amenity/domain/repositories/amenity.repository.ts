import type { AmenityScope } from '../constants/amenity-scope.constant';
import type { Amenity } from '../entities/amenity.entity';

export interface IAmenityRepository {
  findAll(scope?: AmenityScope): Promise<Amenity[]>;
  findActive(scope?: AmenityScope): Promise<Amenity[]>;
  findById(id: number): Promise<Amenity | null>;
  findByName(name: string, scope: AmenityScope): Promise<Amenity | null>;
  findByIds(ids: number[]): Promise<Amenity[]>;
  create(amenity: Amenity): Promise<Amenity>;
  update(amenity: Amenity): Promise<Amenity>;
  delete(id: number): Promise<boolean>;
  countPropertyUsages(id: number): Promise<number>;
  countRoomUsages(id: number): Promise<number>;
}

export const AMENITY_REPOSITORY = 'AMENITY_REPOSITORY';
