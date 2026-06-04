import { Module } from '@nestjs/common';
import { PropertyController } from './interfaces/http/property.controller';
import { PropertyTypeController } from './interfaces/http/property-type.controller';
import { ListPropertyUseCase } from './applications/useCase/listProperty.usecase';
import { ListPropertyOptionsUseCase } from './applications/useCase/listPropertyOptions.usecase';
import { PROPERTY_REPOSITORY, PropertyRepository } from './infrastructure/repositories/property.repository';
import { PROPERTY_TYPE_REPOSITORY } from './domain/repositories/property-type.repository';
import { PropertyTypeRepository } from './infrastructure/repositories/property-type.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyEntity } from './infrastructure/entities/property-entity.entity';
import { PropertyTypeEntity } from './infrastructure/entities/property-type.entity';
import { FindOnePropertyUseCase } from './applications/useCase/findOneProperty.usecase';
import { CreatePropertyUseCase } from './applications/useCase/createProperty.usecase';
import { UpdatePropertyUseCase } from './applications/useCase/updateProperty.usecase';
import { DeletePropertyUseCase } from './applications/useCase/deleteProperty.usecase';
import { ListPropertyTypesUseCase } from './applications/useCase/list-property-types.usecase';
import { ListPropertyTypeOptionsUseCase } from './applications/useCase/list-property-type-options.usecase';
import { CreatePropertyTypeUseCase } from './applications/useCase/create-property-type.usecase';
import { UpdatePropertyTypeUseCase } from './applications/useCase/update-property-type.usecase';
import { DeletePropertyTypeUseCase } from './applications/useCase/delete-property-type.usecase';
import { PropertyTypesSeedService } from './infrastructure/seed/property-types.seed';
import { MediaModule } from '../media/media.module';
import { PropertyMediaPresenter } from './applications/presenters/property-media.presenter';

@Module({
  imports: [
    TypeOrmModule.forFeature([PropertyEntity, PropertyTypeEntity]),
    MediaModule,
  ],
  controllers: [PropertyController, PropertyTypeController],
  providers: [
    ListPropertyUseCase,
    ListPropertyOptionsUseCase,
    FindOnePropertyUseCase,
    CreatePropertyUseCase,
    UpdatePropertyUseCase,
    DeletePropertyUseCase,
    ListPropertyTypesUseCase,
    ListPropertyTypeOptionsUseCase,
    CreatePropertyTypeUseCase,
    UpdatePropertyTypeUseCase,
    DeletePropertyTypeUseCase,
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
    ListPropertyTypeOptionsUseCase,
    CreatePropertyUseCase,
    UpdatePropertyUseCase,
    PropertyMediaPresenter,
  ],
})
export class PropertiesModule {}
