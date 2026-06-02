import { PropertyOutput } from "../dto/property.outup";
import type { IPropertyRepository } from "../../domain/repositories/property.repository";
import { CreatePropertyDto } from "../dto/createProperty.dto";
import { Inject } from "@nestjs/common";
import { PROPERTY_REPOSITORY } from "../../infrastructure/repositories/property.repository";

export class UpdatePropertyUseCase {
    constructor(@Inject(PROPERTY_REPOSITORY) private readonly repository: IPropertyRepository) {}

    async execute(id: number, updatePropertyDto: CreatePropertyDto): Promise<PropertyOutput> {
        const property = await this.repository.findById(id);
        if (!property) {
            throw new Error('Property not found');
        }

        property.name = updatePropertyDto.name;
        property.description = updatePropertyDto.description;
        property.type = updatePropertyDto.type;
        property.address = updatePropertyDto.address;
        property.city = updatePropertyDto.city;
        property.country = updatePropertyDto.country;
        property.latitude = updatePropertyDto.latitude;
        property.longitude = updatePropertyDto.longitude;
        property.checkInTime = updatePropertyDto.checkInTime;
        property.checkOutTime = updatePropertyDto.checkOutTime;
        property.ownerId = updatePropertyDto.ownerId;

        const updatedProperty = await this.repository.update(property);
        return PropertyOutput.fromDomain(updatedProperty);
    }
}
