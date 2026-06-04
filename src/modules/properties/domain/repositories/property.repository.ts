import type { PaginatedResult, PaginationParams } from '../../../../shared/pagination/pagination.types';
import { Property } from "../entities/property.entity";

export interface IPropertyRepository {
    create(property: Property): Promise<Property>;
    update(property: Property): Promise<Property>;
    findById(id: number): Promise<Property|null>;
    findAll(): Promise<Property[]>;
    findPaginated(params: PaginationParams): Promise<PaginatedResult<Property>>;
    delete(id: number): Promise<boolean>;
    findByOwnerId(ownerId: number): Promise<Property | null>;
}
