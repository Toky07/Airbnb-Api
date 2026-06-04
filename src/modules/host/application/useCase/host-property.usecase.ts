import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { JwtPayload } from '../../../authentication/domain/types/jwt-payload';
import type { CreatePropertyDto } from '../../../properties/applications/dto/createProperty.dto';
import { CreatePropertyUseCase } from '../../../properties/applications/useCase/createProperty.usecase';
import { UpdatePropertyUseCase } from '../../../properties/applications/useCase/updateProperty.usecase';
import { PROPERTY_REPOSITORY } from '../../../properties/infrastructure/repositories/property.repository';
import type { IPropertyRepository } from '../../../properties/domain/repositories/property.repository';
import { PropertyMediaPresenter } from '../../../properties/applications/presenters/property-media.presenter';
import { PropertyOutput } from '../../../properties/applications/dto/property.outup';
import type { UploadFile } from '../../../media/types/upload-file';
import { ResolveHostUserService } from '../services/resolve-host-user.service';

@Injectable()
export class GetHostPropertyUseCase {
  constructor(
    private readonly resolveHostUser: ResolveHostUserService,
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: IPropertyRepository,
    private readonly propertyPresenter: PropertyMediaPresenter,
  ) {}

  async execute(authUser: JwtPayload): Promise<PropertyOutput | null> {
    const user = await this.resolveHostUser.resolve(authUser.sub);
    const property = await this.propertyRepository.findByOwnerId(user.id!);
    return property ? this.propertyPresenter.toOutput(property) : null;
  }
}

@Injectable()
export class CreateHostPropertyUseCase {
  constructor(
    private readonly resolveHostUser: ResolveHostUserService,
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: IPropertyRepository,
    private readonly createPropertyUseCase: CreatePropertyUseCase,
  ) {}

  async execute(
    authUser: JwtPayload,
    dto: Omit<CreatePropertyDto, 'ownerId'>,
    image?: UploadFile,
  ): Promise<PropertyOutput> {
    const user = await this.resolveHostUser.resolve(authUser.sub);
    const existing = await this.propertyRepository.findByOwnerId(user.id!);

    if (existing) {
      throw new BadRequestException('Vous avez déjà un établissement.');
    }

    return this.createPropertyUseCase.execute(
      { ...dto, ownerId: user.id! },
      image,
    );
  }
}

@Injectable()
export class UpdateHostPropertyUseCase {
  constructor(
    private readonly resolveHostUser: ResolveHostUserService,
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: IPropertyRepository,
    private readonly updatePropertyUseCase: UpdatePropertyUseCase,
  ) {}

  async execute(
    authUser: JwtPayload,
    dto: Omit<CreatePropertyDto, 'ownerId'>,
    image?: UploadFile,
  ): Promise<PropertyOutput> {
    const user = await this.resolveHostUser.resolve(authUser.sub);
    const property = await this.propertyRepository.findByOwnerId(user.id!);

    if (!property?.id) {
      throw new NotFoundException('Établissement introuvable.');
    }

    if (property.ownerId !== user.id) {
      throw new ForbiddenException('Accès refusé à cet établissement.');
    }

    return this.updatePropertyUseCase.execute(
      property.id,
      { ...dto, ownerId: user.id! },
      image,
    );
  }
}
