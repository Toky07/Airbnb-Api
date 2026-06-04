import { Inject, Injectable } from '@nestjs/common';
import { PropertyTypeOutput } from '../dto/property-type.output';
import {
  PROPERTY_TYPE_REPOSITORY,
  type IPropertyTypeRepository,
} from '../../domain/repositories/property-type.repository';

@Injectable()
export class ListPropertyTypesUseCase {
  constructor(
    @Inject(PROPERTY_TYPE_REPOSITORY)
    private readonly repository: IPropertyTypeRepository,
  ) {}

  async execute(): Promise<PropertyTypeOutput[]> {
    const types = await this.repository.findAll();
    return types.map(PropertyTypeOutput.fromDomain);
  }
}
