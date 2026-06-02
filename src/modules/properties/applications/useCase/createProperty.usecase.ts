import { CreatePropertyDto } from "../dto/createProperty.dto";
import type { IPropertyRepository } from "../../domain/repositories/property.repository";
import { Property } from "../../domain/entities/property.entity";
import { PropertyOutput } from "../dto/property.outup";
import { PROPERTY_REPOSITORY } from "../../infrastructure/repositories/property.repository";
import { Inject } from "@nestjs/common";

export class CreatePropertyUseCase {
    constructor(@Inject(PROPERTY_REPOSITORY) private readonly repository: IPropertyRepository) {}

    async execute(createPropertyDto: CreatePropertyDto): Promise<PropertyOutput> {
        const property = new Property(createPropertyDto);
        const newProperty = await this.repository.create(property);
        
        return PropertyOutput.fromDomain(newProperty);
    }
}
