import { Inject } from "@nestjs/common";
import type { IPropertyRepository } from "../../domain/repositories/property.repository";
import { PROPERTY_REPOSITORY } from "../../infrastructure/repositories/property.repository";

export class DeletePropertyUseCase {
    constructor(@Inject(PROPERTY_REPOSITORY) private readonly repository: IPropertyRepository) {}

    async execute(id: number): Promise<boolean> {
        const property = await this.repository.findById(id);
        
        if (!property) {
            throw new Error('Property not found');
        }

        return this.repository.delete(id);
    }
}
