import { CreatePropertyDto } from "../dto/createProperty.dto";
import type { IPropertyRepository } from "../../domain/repositories/property.repository";
import { Property } from "../../domain/entities/property.entity";
import { PropertyOutput } from "../dto/property.outup";
import { PROPERTY_REPOSITORY } from "../../infrastructure/repositories/property.repository";
import { Inject } from "@nestjs/common";
import { ENTITY_TYPE } from "../../../media/constant";
import { SaveEntityMediasUseCase } from "../../../media/applications/useCase/saveEntityMedias.usecase";
import { PropertyMediaPresenter } from "../presenters/property-media.presenter";
import type { UploadFile } from "../../../media/types/upload-file";

export class CreatePropertyUseCase {
    constructor(
        @Inject(PROPERTY_REPOSITORY) private readonly repository: IPropertyRepository,
        private readonly saveEntityMedias: SaveEntityMediasUseCase,
        private readonly presenter: PropertyMediaPresenter,
    ) {}

    async execute(
        createPropertyDto: CreatePropertyDto,
        image?: UploadFile,
    ): Promise<PropertyOutput> {
        const property = new Property(createPropertyDto);
        const newProperty = await this.repository.create(property);

        if (image) {
            await this.saveEntityMedias.execute(
                ENTITY_TYPE.PROPERTY,
                newProperty.id!,
                [image],
            );
        }

        return this.presenter.toOutput(newProperty);
    }
}
