import { IPropertyRepository } from "../../domain/repositories/property.repository";
import { PropertyOutput } from "../dto/property.outup";

export class ListPropertyUseCase {
    constructor(private readonly repository: IPropertyRepository) {}

    async execute(): Promise<PropertyOutput[]> {
        const properties = await this.repository.findAll();
        return properties.map((property) => PropertyOutput.fromDomain(property));
    }
}
