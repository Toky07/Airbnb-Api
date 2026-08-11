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
} from '../domain/repositories/property.repository';
export {
  PROPERTY_TYPE_REPOSITORY,
  type IPropertyTypeRepository,
} from '../domain/repositories/property-type.repository';
export { Property } from '../domain/entities/property.entity';
export { PropertyOutput } from '../applications/dto/property.output';
export { PropertyTypeOutput } from '../applications/dto/property-type.output';
export type { CreatePropertyDto } from '../applications/dto/createProperty.dto';
export { parsePropertyBody } from '../interfaces/http/parse-property-body';
export { PropertyMediaPresenter } from '../applications/presenters/property-media.presenter';
export { CreatePropertyCommand } from '../applications/useCase/commands/CreatePropertyCommand';
export { UpdatePropertyCommand } from '../applications/useCase/commands/UpdatePropertyCommand';
export { DeletePropertyCommand } from '../applications/useCase/commands/DeletePropertyCommand';
export { CreatePropertyTypeCommand } from '../applications/useCase/commands/CreatePropertyTypeCommand';
export { UpdatePropertyTypeCommand } from '../applications/useCase/commands/UpdatePropertyTypeCommand';
export { DeletePropertyTypeCommand } from '../applications/useCase/commands/DeletePropertyTypeCommand';
export { FindPropertyQuery } from '../applications/useCase/queries/FindPropertyQuery';
export { ListPropertiesQuery } from '../applications/useCase/queries/ListPropertiesQuery';
export { ListPropertyOptionsQuery } from '../applications/useCase/queries/ListPropertyOptionsQuery';
export { ListPropertyTypesQuery } from '../applications/useCase/queries/ListPropertyTypesQuery';
export { ListPropertyTypeOptionsQuery } from '../applications/useCase/queries/ListPropertyTypeOptionsQuery';
