import { PropertyOutput } from "../dto/property.outup";
import { IPropertyRepository } from "../../domain/repositories/property.repository";

export class FindOnePropertyUseCase {
    constructor(private readonly repository: IPropertyRepository) {}

    async execute(id: number): Promise<PropertyOutput> {
        const property = await this.repository.findById(id);
        if (!property) {
            throw new Error('Property not found');
        }
        return PropertyOutput.fromDomain(property);
    }
}
