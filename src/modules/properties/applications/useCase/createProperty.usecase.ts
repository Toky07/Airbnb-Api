import { CreatePropertyDto } from "../dto/createProperty.dto";
import { IPropertyRepository } from "../../domain/repositories/property.repository";
import { Property } from "../../domain/entities/property.entity";
import { PropertyOutput } from "../dto/property.outup";

export class CreatePropertyUseCase {
    constructor(private readonly repository: IPropertyRepository) {}

    async execute(createPropertyDto: CreatePropertyDto): Promise<PropertyOutput> {
        const property = new Property(createPropertyDto);
        const newProperty = await this.repository.create(property);
        
        return PropertyOutput.fromDomain(newProperty);
    }
}
