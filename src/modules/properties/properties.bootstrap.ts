import type { IPropertyRepository } from './domain/repositories/property.repository';
import type { IPropertyTypeRepository } from './domain/repositories/property-type.repository';
import type { PropertyMediaPresenter } from './applications/presenters/property-media.presenter';
import { CreatePropertyCommandHandler } from './applications/useCase/handlers/CreatePropertyCommandHandler';
import { UpdatePropertyCommandHandler } from './applications/useCase/handlers/UpdatePropertyCommandHandler';
import { DeletePropertyCommandHandler } from './applications/useCase/handlers/DeletePropertyCommandHandler';
import { FindPropertyQueryHandler } from './applications/useCase/handlers/FindPropertyQueryHandler';
import { ListPropertiesQueryHandler } from './applications/useCase/handlers/ListPropertiesQueryHandler';
import { ListPropertyOptionsQueryHandler } from './applications/useCase/handlers/ListPropertyOptionsQueryHandler';
import { CreatePropertyTypeCommandHandler } from './applications/useCase/handlers/CreatePropertyTypeCommandHandler';
import { UpdatePropertyTypeCommandHandler } from './applications/useCase/handlers/UpdatePropertyTypeCommandHandler';
import { DeletePropertyTypeCommandHandler } from './applications/useCase/handlers/DeletePropertyTypeCommandHandler';
import { ListPropertyTypesQueryHandler } from './applications/useCase/handlers/ListPropertyTypesQueryHandler';
import { ListPropertyTypeOptionsQueryHandler } from './applications/useCase/handlers/ListPropertyTypeOptionsQueryHandler';

export class PropertiesBootstrap {
  static create(deps: {
    propertyRepository: IPropertyRepository;
    propertyTypeRepository: IPropertyTypeRepository;
    propertyMediaPresenter: PropertyMediaPresenter;
  }) {
    return {
      createPropertyCommandHandler: new CreatePropertyCommandHandler(
        deps.propertyRepository,
        deps.propertyMediaPresenter,
      ),
      updatePropertyCommandHandler: new UpdatePropertyCommandHandler(
        deps.propertyRepository,
        deps.propertyMediaPresenter,
      ),
      deletePropertyCommandHandler: new DeletePropertyCommandHandler(
        deps.propertyRepository,
      ),
      findPropertyQueryHandler: new FindPropertyQueryHandler(
        deps.propertyRepository,
        deps.propertyMediaPresenter,
      ),
      listPropertiesQueryHandler: new ListPropertiesQueryHandler(
        deps.propertyRepository,
        deps.propertyMediaPresenter,
      ),
      listPropertyOptionsQueryHandler: new ListPropertyOptionsQueryHandler(
        deps.propertyRepository,
        deps.propertyMediaPresenter,
      ),
      createPropertyTypeCommandHandler: new CreatePropertyTypeCommandHandler(
        deps.propertyTypeRepository,
      ),
      updatePropertyTypeCommandHandler: new UpdatePropertyTypeCommandHandler(
        deps.propertyTypeRepository,
      ),
      deletePropertyTypeCommandHandler: new DeletePropertyTypeCommandHandler(
        deps.propertyTypeRepository,
      ),
      listPropertyTypesQueryHandler: new ListPropertyTypesQueryHandler(
        deps.propertyTypeRepository,
      ),
      listPropertyTypeOptionsQueryHandler: new ListPropertyTypeOptionsQueryHandler(
        deps.propertyTypeRepository,
      ),
    };
  }
}
