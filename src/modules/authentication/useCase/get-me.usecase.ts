import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AUTH_REPOSITORY } from '../domain/repositories/auth.repository';
import type { IAuthRepository } from '../domain/repositories/auth.repository';
import { HOST_ROLE_SLUG } from '../domain/constants/permissions.constant';
import { MeOutput } from '../application/dto/me.output';
import { HostAccessOutput } from '../application/dto/host-access.output';
import { UserProfileOutput } from '../application/dto/user-profile.output';
import { buildJwtPayload } from '../domain/utils/build-jwt-payload';
import { USER_REPOSITORY } from '../../user/infrastructure/repositories/user.repository';
import type { IUserRepository } from '../../user/domain/repositories/user.repository';
import { PROPERTY_REPOSITORY } from '../../properties/infrastructure/repositories/property.repository';
import type { IPropertyRepository } from '../../properties/domain/repositories/property.repository';
import type { Property } from '../../properties/domain/entities/property.entity';
import { EnsurePropertyOwnerHostRoleService } from '../application/services/ensure-property-owner-host-role.service';

@Injectable()
export class GetMeUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: IAuthRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: IPropertyRepository,
    private readonly ensurePropertyOwnerHostRole: EnsurePropertyOwnerHostRoleService,
  ) {}

  async execute(authId: number): Promise<MeOutput> {
    let auth = await this.authRepository.findById(authId);

    if (!auth?.id) {
      throw new UnauthorizedException();
    }

    const user = await this.userRepository.findByAuthId(auth.id);
    const profile =
      user?.id != null
        ? new UserProfileOutput(
            user.id,
            user.firstName,
            user.lastName,
            user.phoneNumber,
            user.avatar || '',
          )
        : null;

    let properties: Property[] = [];
    if (user?.id != null) {
      properties = await this.propertyRepository.findAllByOwnerId(user.id);

      if (properties.length > 0) {
        await this.ensurePropertyOwnerHostRole.executeForAuthId(auth.id);
        auth = (await this.authRepository.findById(authId)) ?? auth;
      }
    }

    const payload = buildJwtPayload(auth);
    const isHostRole =
      payload.roles.includes(HOST_ROLE_SLUG) || payload.isSuperAdmin;
    const ownsProperty = properties.length > 0;
    const primaryProperty = properties[0] ?? null;

    let hostAccess: HostAccessOutput | null = null;
    if (isHostRole || ownsProperty) {
      hostAccess = new HostAccessOutput(
        isHostRole || ownsProperty,
        ownsProperty,
        primaryProperty?.id ?? null,
        primaryProperty?.name ?? null,
        properties.length,
      );
    }

    return new MeOutput(
      payload.sub,
      payload.email,
      payload.roles,
      payload.permissions,
      payload.isSuperAdmin,
      hostAccess,
      profile,
    );
  }
}
