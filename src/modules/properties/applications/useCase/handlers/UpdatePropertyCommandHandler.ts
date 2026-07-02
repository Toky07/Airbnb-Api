import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import { CommandBus } from '../../../../../shared/useCase/bus/bus';
import type { IPropertyRepository } from '../../../domain/repositories/property.repository';
import { PropertyOutput } from '../../dto/property.outup';
import { ENTITY_TYPE } from '../../../../media/constant';
import { SaveEntityMediasCommand } from '../../../../media/applications/useCase/commands/SaveEntityMediasCommand';
import type { PropertyMediaPresenter } from '../../presenters/property-media.presenter';
import type { UpdatePropertyCommand } from '../commands/UpdatePropertyCommand';

export class UpdatePropertyCommandHandler
  implements ICommandHandler<UpdatePropertyCommand, PropertyOutput>
{
  constructor(
    private readonly repository: IPropertyRepository,
    private readonly presenter: PropertyMediaPresenter,
  ) {}

  async execute(command: UpdatePropertyCommand): Promise<PropertyOutput> {
    const property = await this.repository.findById(command.id);
    if (!property) {
      throw new Error('Property not found');
    }

    property.name = command.dto.name;
    property.description = command.dto.description;
    property.address = command.dto.address;
    property.city = command.dto.city;
    property.country = command.dto.country;
    property.latitude = command.dto.latitude;
    property.longitude = command.dto.longitude;
    property.checkInTime = command.dto.checkInTime;
    property.checkOutTime = command.dto.checkOutTime;
    property.ownerId = command.dto.ownerId;
    property.propertyTypeId = command.dto.propertyTypeId ?? null;
    property.propertyType = null;

    const updatedProperty = await this.repository.update(property);

    if (command.image) {
      await CommandBus.execute(
        new SaveEntityMediasCommand(
          ENTITY_TYPE.PROPERTY,
          updatedProperty.id!,
          [command.image],
        ),
      );
    }

    return this.presenter.toOutput(updatedProperty);
  }
}
