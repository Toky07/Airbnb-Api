import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import { CommandBus } from '@src/shared/useCase/bus/bus';
import type { IPropertyRepository } from '@src/modules/properties/domain/repositories/property.repository';
import { Property } from '@src/modules/properties/domain/entities/property.entity';
import { PropertyOutput } from '@src/modules/properties/applications/dto/property.output';
import { ENTITY_TYPE } from '@src/modules/media/contracts';
import { SaveEntityMediasCommand } from '@src/modules/media/contracts';
import type { PropertyMediaPresenter } from '@src/modules/properties/applications/presenters/property-media.presenter';
import type { CreatePropertyCommand } from '@src/modules/properties/applications/useCase/commands/CreatePropertyCommand';

export class CreatePropertyCommandHandler implements ICommandHandler<
  CreatePropertyCommand,
  PropertyOutput
> {
  constructor(
    private readonly repository: IPropertyRepository,
    private readonly presenter: PropertyMediaPresenter,
  ) {}

  async execute(command: CreatePropertyCommand): Promise<PropertyOutput> {
    const property = new Property(command.dto);
    const newProperty = await this.repository.create(property);

    if (command.image) {
      await CommandBus.execute(
        new SaveEntityMediasCommand(ENTITY_TYPE.PROPERTY, newProperty.id!, [
          command.image,
        ]),
      );
    }

    return this.presenter.toOutput(newProperty);
  }
}
