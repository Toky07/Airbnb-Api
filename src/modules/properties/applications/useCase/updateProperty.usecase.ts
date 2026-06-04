import { PropertyOutput } from "../dto/property.outup";
import type { IPropertyRepository } from "../../domain/repositories/property.repository";
import { CreatePropertyDto } from "../dto/createProperty.dto";
import { Inject } from "@nestjs/common";
import { PROPERTY_REPOSITORY } from "../../infrastructure/repositories/property.repository";
import { ENTITY_TYPE } from "../../../media/constant";
import { SaveEntityMediasUseCase } from "../../../media/applications/useCase/saveEntityMedias.usecase";
import { PropertyMediaPresenter } from "../presenters/property-media.presenter";
import type { UploadFile } from "../../../media/types/upload-file";

export class UpdatePropertyUseCase {
    constructor(
        @Inject(PROPERTY_REPOSITORY) private readonly repository: IPropertyRepository,
        private readonly saveEntityMedias: SaveEntityMediasUseCase,
        private readonly presenter: PropertyMediaPresenter,
    ) {}

    async execute(
        id: number,
        updatePropertyDto: CreatePropertyDto,
        image?: UploadFile,
    ): Promise<PropertyOutput> {
        const property = await this.repository.findById(id);
        if (!property) {
            throw new Error('Property not found');
        }

        property.name = updatePropertyDto.name;
        property.description = updatePropertyDto.description;
        property.address = updatePropertyDto.address;
        property.city = updatePropertyDto.city;
        property.country = updatePropertyDto.country;
        property.latitude = updatePropertyDto.latitude;
        property.longitude = updatePropertyDto.longitude;
        property.checkInTime = updatePropertyDto.checkInTime;
        property.checkOutTime = updatePropertyDto.checkOutTime;
        property.ownerId = updatePropertyDto.ownerId;
        property.propertyTypeId = updatePropertyDto.propertyTypeId ?? null;
        property.propertyType = null;

        const updatedProperty = await this.repository.update(property);

        if (image) {
            await this.saveEntityMedias.execute(
                ENTITY_TYPE.PROPERTY,
                updatedProperty.id!,
                [image],
            );
        }

        return this.presenter.toOutput(updatedProperty);
    }
}
