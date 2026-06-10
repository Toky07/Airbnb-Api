import { Injectable } from '@nestjs/common';
import type { JwtPayload } from '../../../authentication/domain/types/jwt-payload';
import { PropertyMediaPresenter } from '../../../properties/applications/presenters/property-media.presenter';
import { HostProfileOutput } from '../dto/host-profile.output';
import { ResolveHostUserService } from '../services/resolve-host-user.service';
import { ResolveHostPropertyService } from '../services/resolve-host-property.service';

@Injectable()
export class GetHostProfileUseCase {
  constructor(
    private readonly resolveHostUser: ResolveHostUserService,
    private readonly resolveHostProperty: ResolveHostPropertyService,
    private readonly propertyPresenter: PropertyMediaPresenter,
  ) {}

  async execute(authUser: JwtPayload): Promise<HostProfileOutput> {
    const user = await this.resolveHostUser.resolve(authUser.sub);
    const properties = await this.resolveHostProperty.listOwned(authUser);
    const propertyOutputs = await Promise.all(
      properties.map((property) => this.propertyPresenter.toOutput(property)),
    );

    return new HostProfileOutput(
      {
        id: user.id!,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
      propertyOutputs,
    );
  }
}
