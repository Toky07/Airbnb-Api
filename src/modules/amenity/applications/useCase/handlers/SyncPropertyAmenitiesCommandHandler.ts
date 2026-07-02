import { NotFoundException } from '@nestjs/common';
import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import { AMENITY_SCOPE } from '../../../domain/constants/amenity-scope.constant';
import type { IPropertyRepository } from '../../../../properties/domain/repositories/property.repository';
import type { IPropertyAmenityRepository } from '../../../domain/repositories/property-amenity.repository';
import { AmenityOutput } from '../../dto/amenity.output';
import type { ResolveAmenitiesService } from '../../services/resolve-amenities.service';
import type { SyncPropertyAmenitiesCommand } from '../commands/SyncPropertyAmenitiesCommand';

export class SyncPropertyAmenitiesCommandHandler
  implements ICommandHandler<SyncPropertyAmenitiesCommand, AmenityOutput[]>
{
  constructor(
    private readonly propertyRepository: IPropertyRepository,
    private readonly propertyAmenityRepository: IPropertyAmenityRepository,
    private readonly resolveAmenitiesService: ResolveAmenitiesService,
  ) {}

  async execute(command: SyncPropertyAmenitiesCommand): Promise<AmenityOutput[]> {
    const property = await this.propertyRepository.findById(command.propertyId);
    if (!property) {
      throw new NotFoundException('Établissement introuvable');
    }

    const amenities = await this.resolveAmenitiesService.resolveActiveAmenities(
      command.dto.amenityIds ?? [],
      AMENITY_SCOPE.PROPERTY,
    );

    await this.propertyAmenityRepository.replaceForProperty(
      command.propertyId,
      amenities.map((amenity) => amenity.id!),
    );

    return this.resolveAmenitiesService.toOutputs(amenities);
  }
}
