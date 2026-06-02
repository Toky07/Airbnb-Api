import { Property } from '../../../domain/entities/property.entity';
import { PropertyOutput } from '../../dto/property.outup';
import { PropertyMediaPresenter } from '../../presenters/property-media.presenter';
import { SaveEntityMediasUseCase } from '../../../../media/applications/useCase/saveEntityMedias.usecase';
import { DeleteMediasByEntityUseCase } from '../../../../media/applications/useCase/deleteMediasByEntity.usecase';

export const mockSaveEntityMedias = {
  execute: async () => [],
} as unknown as SaveEntityMediasUseCase;

export const mockDeleteMediasByEntity = {
  execute: async () => undefined,
} as unknown as DeleteMediasByEntityUseCase;

export const mockPropertyMediaPresenter = {
  toOutput: async (property: Property) =>
    PropertyOutput.fromDomain(property, null),
} as PropertyMediaPresenter;
