import { Inject, Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyController } from './interfaces/http/property.controller';
import { PropertyTypeController } from './interfaces/http/property-type.controller';
import { PROPERTY_REPOSITORY, PropertyRepository } from './infrastructure/repositories/property.repository';
import type { IPropertyRepository } from './domain/repositories/property.repository';
import { PROPERTY_TYPE_REPOSITORY } from './domain/repositories/property-type.repository';
import type { IPropertyTypeRepository } from './domain/repositories/property-type.repository';
import { PropertyTypeRepository } from './infrastructure/repositories/property-type.repository';
import { PropertyEntity } from './infrastructure/entities/property-entity.entity';
import { PropertyTypeEntity } from './infrastructure/entities/property-type.entity';
import { PropertyTypesSeedService } from './infrastructure/seed/property-types.seed';
import { MediaModule } from '../media/media.module';
import { PropertyMediaPresenter } from './applications/presenters/property-media.presenter';
import { PropertiesBootstrap } from './properties.bootstrap';
import { CommandBus } from '../../shared/useCase/bus/bus';
import { QueryBus } from '../../shared/useCase/bus/query-bus';
import { CreatePropertyCommand } from './applications/useCase/commands/CreatePropertyCommand';
import { UpdatePropertyCommand } from './applications/useCase/commands/UpdatePropertyCommand';
import { DeletePropertyCommand } from './applications/useCase/commands/DeletePropertyCommand';
import { CreatePropertyTypeCommand } from './applications/useCase/commands/CreatePropertyTypeCommand';
import { UpdatePropertyTypeCommand } from './applications/useCase/commands/UpdatePropertyTypeCommand';
import { DeletePropertyTypeCommand } from './applications/useCase/commands/DeletePropertyTypeCommand';
import { FindPropertyQuery } from './applications/useCase/queries/FindPropertyQuery';
import { ListPropertiesQuery } from './applications/useCase/queries/ListPropertiesQuery';
import { ListPropertyOptionsQuery } from './applications/useCase/queries/ListPropertyOptionsQuery';
import { ListPropertyTypesQuery } from './applications/useCase/queries/ListPropertyTypesQuery';
import { ListPropertyTypeOptionsQuery } from './applications/useCase/queries/ListPropertyTypeOptionsQuery';

@Module({
  imports: [
    TypeOrmModule.forFeature([PropertyEntity, PropertyTypeEntity]),
    MediaModule,
  ],
  controllers: [PropertyController, PropertyTypeController],
  providers: [
    PropertyTypesSeedService,
    PropertyMediaPresenter,
    {
      provide: PROPERTY_REPOSITORY,
      useClass: PropertyRepository,
    },
    {
      provide: PROPERTY_TYPE_REPOSITORY,
      useClass: PropertyTypeRepository,
    },
  ],
  exports: [
    PROPERTY_REPOSITORY,
    PROPERTY_TYPE_REPOSITORY,
    PropertyMediaPresenter,
  ],
})
export class PropertiesModule implements OnModuleInit {
  constructor(
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: IPropertyRepository,
    @Inject(PROPERTY_TYPE_REPOSITORY)
    private readonly propertyTypeRepository: IPropertyTypeRepository,
    private readonly propertyMediaPresenter: PropertyMediaPresenter,
  ) {}

  onModuleInit() {
    const bootstrap = PropertiesBootstrap.create({
      propertyRepository: this.propertyRepository,
      propertyTypeRepository: this.propertyTypeRepository,
      propertyMediaPresenter: this.propertyMediaPresenter,
    });

    CommandBus.register(CreatePropertyCommand, bootstrap.createPropertyCommandHandler);
    CommandBus.register(UpdatePropertyCommand, bootstrap.updatePropertyCommandHandler);
    CommandBus.register(DeletePropertyCommand, bootstrap.deletePropertyCommandHandler);
    CommandBus.register(CreatePropertyTypeCommand, bootstrap.createPropertyTypeCommandHandler);
    CommandBus.register(UpdatePropertyTypeCommand, bootstrap.updatePropertyTypeCommandHandler);
    CommandBus.register(DeletePropertyTypeCommand, bootstrap.deletePropertyTypeCommandHandler);

    QueryBus.register(FindPropertyQuery, bootstrap.findPropertyQueryHandler);
    QueryBus.register(ListPropertiesQuery, bootstrap.listPropertiesQueryHandler);
    QueryBus.register(ListPropertyOptionsQuery, bootstrap.listPropertyOptionsQueryHandler);
    QueryBus.register(ListPropertyTypesQuery, bootstrap.listPropertyTypesQueryHandler);
    QueryBus.register(ListPropertyTypeOptionsQuery, bootstrap.listPropertyTypeOptionsQueryHandler);
  }
}
