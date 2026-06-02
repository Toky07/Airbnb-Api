import { Inject } from "@nestjs/common";
import type { IPropertyRepository } from "../../domain/repositories/property.repository";
import { PROPERTY_REPOSITORY } from "../../infrastructure/repositories/property.repository";
import { ENTITY_TYPE } from "../../../media/constant";
import { DeleteMediasByEntityUseCase } from "../../../media/applications/useCase/deleteMediasByEntity.usecase";

export class DeletePropertyUseCase {
    constructor(
        @Inject(PROPERTY_REPOSITORY) private readonly repository: IPropertyRepository,
        private readonly deleteMediasByEntity: DeleteMediasByEntityUseCase,
    ) {}

    async execute(id: number): Promise<boolean> {
        const property = await this.repository.findById(id);

        if (!property) {
            throw new Error('Property not found');
        }

        await this.deleteMediasByEntity.execute(ENTITY_TYPE.PROPERTY, id);

        return this.repository.delete(id);
    }
}
