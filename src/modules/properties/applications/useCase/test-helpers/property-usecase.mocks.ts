import { Property } from '../../../domain/entities/property.entity';
import { PropertyOutput } from '../../dto/property.outup';
import { PropertyMediaPresenter } from '../../presenters/property-media.presenter';

export const mockPropertyMediaPresenter = {
  toOutput: async (property: Property) =>
    PropertyOutput.fromDomain(property, null),
} as PropertyMediaPresenter;
