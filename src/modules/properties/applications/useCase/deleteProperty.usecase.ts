import { IPropertyRepository } from "../../domain/repositories/property.repository";

export class DeletePropertyUseCase {
    constructor(private readonly repository: IPropertyRepository) {}

    async execute(id: number): Promise<boolean> {
        const property = await this.repository.findById(id);
        
        if (!property) {
            throw new Error('Property not found');
        }

        return this.repository.delete(id);
    }
}
