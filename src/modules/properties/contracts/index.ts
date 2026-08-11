/**
 * Surface publique du module properties.
 * Les autres modules doivent importer uniquement depuis ce barrel
 * (sauf PropertiesModule Nest et ORM PropertyEntity).
 * Pour éviter les cycles rooms↔properties, préférer le leaf
 * `contracts/property-summary` depuis le module rooms.
 */
export {
  toPropertySummary,
  type PropertySummary,
  type PropertySummarySource,
} from './property-summary';
export {
  PROPERTY_REPOSITORY,
  type IPropertyRepository,
} from '@src/modules/properties/domain/repositories/property.repository';
export {
  PROPERTY_TYPE_REPOSITORY,
  type IPropertyTypeRepository,
} from '@src/modules/properties/domain/repositories/property-type.repository';
export { Property } from '@src/modules/properties/domain/entities/property.entity';
export { PropertyOutput } from '@src/modules/properties/applications/dto/property.output';
export { PropertyTypeOutput } from '@src/modules/properties/applications/dto/property-type.output';
export type { CreatePropertyDto } from '@src/modules/properties/applications/dto/createProperty.dto';
export { parsePropertyBody } from '@src/modules/properties/interfaces/http/parse-property-body';
export { PropertyMediaPresenter } from '@src/modules/properties/applications/presenters/property-media.presenter';
export { CreatePropertyCommand } from '@src/modules/properties/applications/useCase/commands/CreatePropertyCommand';
export { UpdatePropertyCommand } from '@src/modules/properties/applications/useCase/commands/UpdatePropertyCommand';
export { DeletePropertyCommand } from '@src/modules/properties/applications/useCase/commands/DeletePropertyCommand';
export { CreatePropertyTypeCommand } from '@src/modules/properties/applications/useCase/commands/CreatePropertyTypeCommand';
export { UpdatePropertyTypeCommand } from '@src/modules/properties/applications/useCase/commands/UpdatePropertyTypeCommand';
export { DeletePropertyTypeCommand } from '@src/modules/properties/applications/useCase/commands/DeletePropertyTypeCommand';
export { FindPropertyQuery } from '@src/modules/properties/applications/useCase/queries/FindPropertyQuery';
export { ListPropertiesQuery } from '@src/modules/properties/applications/useCase/queries/ListPropertiesQuery';
export { ListPropertyOptionsQuery } from '@src/modules/properties/applications/useCase/queries/ListPropertyOptionsQuery';
export { ListPropertyTypesQuery } from '@src/modules/properties/applications/useCase/queries/ListPropertyTypesQuery';
export { ListPropertyTypeOptionsQuery } from '@src/modules/properties/applications/useCase/queries/ListPropertyTypeOptionsQuery';
