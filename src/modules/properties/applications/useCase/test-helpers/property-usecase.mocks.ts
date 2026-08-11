import { Property } from '@src/modules/properties/domain/entities/property.entity';
import { PropertyOutput } from '@src/modules/properties/applications/dto/property.output';
import { PropertyMediaPresenter } from '@src/modules/properties/applications/presenters/property-media.presenter';

export const mockPropertyMediaPresenter = {
  toOutput: async (property: Property) =>
    PropertyOutput.fromDomain(property, null),
} as PropertyMediaPresenter;
