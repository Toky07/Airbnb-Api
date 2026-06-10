import { Inject, Injectable } from '@nestjs/common';
import type { JwtPayload } from '../../../authentication/domain/types/jwt-payload';
import type { CreatePropertyDto } from '../../../properties/applications/dto/createProperty.dto';
import { CreatePropertyUseCase } from '../../../properties/applications/useCase/createProperty.usecase';
import { UpdatePropertyUseCase } from '../../../properties/applications/useCase/updateProperty.usecase';
import { PropertyMediaPresenter } from '../../../properties/applications/presenters/property-media.presenter';
import { PropertyOutput } from '../../../properties/applications/dto/property.outup';
import type { UploadFile } from '../../../media/types/upload-file';
import { ResolveHostUserService } from '../services/resolve-host-user.service';
import { ResolveHostPropertyService } from '../services/resolve-host-property.service';

@Injectable()
export class ListHostPropertiesUseCase {
  constructor(
    private readonly resolveHostProperty: ResolveHostPropertyService,
    private readonly propertyPresenter: PropertyMediaPresenter,
  ) {}

  async execute(authUser: JwtPayload): Promise<PropertyOutput[]> {
    const properties = await this.resolveHostProperty.listOwned(authUser);
    return Promise.all(properties.map((property) => this.propertyPresenter.toOutput(property)));
  }
}

@Injectable()
export class GetHostPropertyUseCase {
  constructor(
    private readonly resolveHostProperty: ResolveHostPropertyService,
    private readonly propertyPresenter: PropertyMediaPresenter,
  ) {}

  async execute(
    authUser: JwtPayload,
    propertyId: number,
  ): Promise<PropertyOutput> {
    const property = await this.resolveHostProperty.requireOwned(authUser, propertyId);
    return this.propertyPresenter.toOutput(property);
  }
}

@Injectable()
export class CreateHostPropertyUseCase {
  constructor(
    private readonly resolveHostUser: ResolveHostUserService,
    private readonly createPropertyUseCase: CreatePropertyUseCase,
  ) {}

  async execute(
    authUser: JwtPayload,
    dto: Omit<CreatePropertyDto, 'ownerId'>,
    image?: UploadFile,
  ): Promise<PropertyOutput> {
    const user = await this.resolveHostUser.resolve(authUser.sub);

    return this.createPropertyUseCase.execute(
      { ...dto, ownerId: user.id! },
      image,
    );
  }
}

@Injectable()
export class UpdateHostPropertyUseCase {
  constructor(
    private readonly resolveHostProperty: ResolveHostPropertyService,
    private readonly resolveHostUser: ResolveHostUserService,
    private readonly updatePropertyUseCase: UpdatePropertyUseCase,
  ) {}

  async execute(
    authUser: JwtPayload,
    propertyId: number,
    dto: Omit<CreatePropertyDto, 'ownerId'>,
    image?: UploadFile,
  ): Promise<PropertyOutput> {
    const user = await this.resolveHostUser.resolve(authUser.sub);
    await this.resolveHostProperty.requireOwned(authUser, propertyId);

    return this.updatePropertyUseCase.execute(
      propertyId,
      { ...dto, ownerId: user.id! },
      image,
    );
  }
}
