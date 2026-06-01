import { Property } from "../entities/property.entity";

export interface IPropertyRepository {
    create(property: Property): Promise<Property>;
    update(property: Property): Promise<Property>;
    findById(id: number): Promise<Property|null>;
    findAll(): Promise<Property[]>;
    delete(id: number): Promise<boolean>;
}
