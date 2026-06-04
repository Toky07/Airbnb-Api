import { Inject, Injectable } from '@nestjs/common';
import type { IPropertyRepository } from '../../domain/repositories/property.repository';
import { PropertyOutput } from '../dto/property.outup';
import { PROPERTY_REPOSITORY } from '../../infrastructure/repositories/property.repository';
import { PropertyMediaPresenter } from '../presenters/property-media.presenter';

@Injectable()
export class ListPropertyOptionsUseCase {
  constructor(
    @Inject(PROPERTY_REPOSITORY) private readonly repository: IPropertyRepository,
    private readonly presenter: PropertyMediaPresenter,
  ) {}

  async execute(): Promise<PropertyOutput[]> {
    const properties = await this.repository.findAll();
    return Promise.all(properties.map((p) => this.presenter.toOutput(p)));
  }
}
