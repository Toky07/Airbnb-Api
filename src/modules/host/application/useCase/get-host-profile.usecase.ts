import { Inject, Injectable } from '@nestjs/common';
import type { JwtPayload } from '../../../authentication/domain/types/jwt-payload';
import { PROPERTY_REPOSITORY } from '../../../properties/infrastructure/repositories/property.repository';
import type { IPropertyRepository } from '../../../properties/domain/repositories/property.repository';
import { PropertyMediaPresenter } from '../../../properties/applications/presenters/property-media.presenter';
import { HostProfileOutput } from '../dto/host-profile.output';
import { ResolveHostUserService } from '../services/resolve-host-user.service';

@Injectable()
export class GetHostProfileUseCase {
  constructor(
    private readonly resolveHostUser: ResolveHostUserService,
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: IPropertyRepository,
    private readonly propertyPresenter: PropertyMediaPresenter,
  ) {}

  async execute(authUser: JwtPayload): Promise<HostProfileOutput> {
    const user = await this.resolveHostUser.resolve(authUser.sub);
    const property = await this.propertyRepository.findByOwnerId(user.id!);
    const propertyOutput = property
      ? await this.propertyPresenter.toOutput(property)
      : null;

    return new HostProfileOutput(
      {
        id: user.id!,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
      propertyOutput,
    );
  }
}
