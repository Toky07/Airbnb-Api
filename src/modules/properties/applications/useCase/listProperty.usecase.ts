import { Inject } from "@nestjs/common";
import type { IPropertyRepository } from "../../domain/repositories/property.repository";
import { PropertyOutput } from "../dto/property.outup";
import { PROPERTY_REPOSITORY } from "../../infrastructure/repositories/property.repository";

export class ListPropertyUseCase {
    constructor(@Inject(PROPERTY_REPOSITORY) private readonly repository: IPropertyRepository) {}

    async execute(): Promise<PropertyOutput[]> {
        const properties = await this.repository.findAll();
        
        return properties.map((property) => PropertyOutput.fromDomain(property));
    }
}
