import { PropertyOutput } from "../dto/property.outup";
import type { IPropertyRepository } from "../../domain/repositories/property.repository";
import { Inject } from "@nestjs/common";
import { PROPERTY_REPOSITORY } from "../../infrastructure/repositories/property.repository";
import { PropertyMediaPresenter } from "../presenters/property-media.presenter";

export class FindOnePropertyUseCase {
    constructor(
        @Inject(PROPERTY_REPOSITORY) private readonly repository: IPropertyRepository,
        private readonly presenter: PropertyMediaPresenter,
    ) {}

    async execute(id: number): Promise<PropertyOutput> {
        const property = await this.repository.findById(id);
        if (!property) {
            throw new Error('Property not found');
        }
        return this.presenter.toOutput(property);
    }
}
