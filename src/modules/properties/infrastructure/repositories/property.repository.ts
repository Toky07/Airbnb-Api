import { PropertyEntity } from "../entities/property-entity.entity";
import { IPropertyRepository } from "../../domain/repositories/property.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Property } from "../../domain/entities/property.entity";
import { PropertyMapper } from "../mappers/property.mapper";

export const PROPERTY_REPOSITORY = 'PROPERTY_REPOSITORY';

export class PropertyRepository implements IPropertyRepository {
    constructor(@InjectRepository(PropertyEntity) private readonly repository: Repository<PropertyEntity>) {}

    async findAll(): Promise<Property[]> {
        const properties = await this.repository.find();
        return properties.map(property => PropertyMapper.toDomain(property));
    }

    async findById(id: number): Promise<Property|null> {
        const property = await this.repository.findOne({ where: { id } });
        return property ? PropertyMapper.toDomain(property) : null;
    }

    async create(property: Property): Promise<Property> {
        const data = this.repository.create(property);
        const newProperty = await this.repository.save(data);

        return PropertyMapper.toDomain(newProperty);
    }

    async update(property: Property): Promise<Property> {
        const data = await this.repository.preload({
            ...PropertyMapper.toEntity(property),
            id: +property.id!,
        });

        if (!data) {
            throw new Error('Property not found');
        }

        const newProperty = await this.repository.save(data);

        return PropertyMapper.toDomain(newProperty);
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.repository.delete(id);
        return result.affected ? result.affected > 0 : false;
    }
}
