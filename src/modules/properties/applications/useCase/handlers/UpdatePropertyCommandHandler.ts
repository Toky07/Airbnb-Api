import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import { CommandBus } from '@src/shared/useCase/bus/bus';
import type { IPropertyRepository } from '@src/modules/properties/domain/repositories/property.repository';
import { PropertyOutput } from '@src/modules/properties/applications/dto/property.output';
import { ENTITY_TYPE } from '@src/modules/media/contracts';
import { SaveEntityMediasCommand } from '@src/modules/media/contracts';
import type { PropertyMediaPresenter } from '@src/modules/properties/applications/presenters/property-media.presenter';
import type { UpdatePropertyCommand } from '@src/modules/properties/applications/useCase/commands/UpdatePropertyCommand';

export class UpdatePropertyCommandHandler implements ICommandHandler<
  UpdatePropertyCommand,
  PropertyOutput
> {
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
    property.cancellationPolicy =
      command.dto.cancellationPolicy ?? property.cancellationPolicy;
    property.touristTaxPerGuestNight =
      command.dto.touristTaxPerGuestNight ?? property.touristTaxPerGuestNight;
    property.ownerId = command.dto.ownerId;
    property.propertyTypeId = command.dto.propertyTypeId ?? null;
    property.propertyType = null;

    const updatedProperty = await this.repository.update(property);

    if (command.image) {
      await CommandBus.execute(
        new SaveEntityMediasCommand(ENTITY_TYPE.PROPERTY, updatedProperty.id!, [
          command.image,
        ]),
      );
    }

    return this.presenter.toOutput(updatedProperty);
  }
}
