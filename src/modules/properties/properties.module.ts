import { Module } from '@nestjs/common';
import { PropertyController } from './interfaces/http/property.controller';
import { ListPropertyUseCase } from './applications/useCase/listProperty.usecase';
import { PROPERTY_REPOSITORY, PropertyRepository } from './infrastructure/repositories/property.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyEntity } from './infrastructure/entities/property-entity.entity';
import { FindOnePropertyUseCase } from './applications/useCase/findOneProperty.usecase';
import { CreatePropertyUseCase } from './applications/useCase/createProperty.usecase';
import { UpdatePropertyUseCase } from './applications/useCase/updateProperty.usecase';
import { DeletePropertyUseCase } from './applications/useCase/deleteProperty.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([PropertyEntity])],
  controllers: [PropertyController],
  providers: [
    ListPropertyUseCase,
    FindOnePropertyUseCase,
    CreatePropertyUseCase,
    UpdatePropertyUseCase,
    DeletePropertyUseCase,
    {
      provide: PROPERTY_REPOSITORY,
      useClass: PropertyRepository,
    },
  ],
})
export class PropertiesModule {}
