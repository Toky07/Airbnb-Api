import { PropertyOutput } from "../dto/property.outup";
import type { IPropertyRepository } from "../../domain/repositories/property.repository";
import { Inject } from "@nestjs/common";
import { PROPERTY_REPOSITORY } from "../../infrastructure/repositories/property.repository";

export class FindOnePropertyUseCase {
    constructor(@Inject(PROPERTY_REPOSITORY) private readonly repository: IPropertyRepository) {}

    async execute(id: number): Promise<PropertyOutput> {
        const property = await this.repository.findById(id);
        if (!property) {
            throw new Error('Property not found');
        }
        return PropertyOutput.fromDomain(property);
    }
}
