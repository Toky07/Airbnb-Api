import { UnauthorizedException } from '@nestjs/common';
import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import type { IAuthRepository } from '@src/modules/authentication/domain/repositories/auth.repository';
import type { IUserRepository } from '@src/modules/user/contracts';
import type { IPropertyRepository } from '@src/modules/properties/contracts';
import { HOST_ROLE_SLUG } from '@src/modules/authentication/domain/constants/permissions.constant';
import { MeOutput } from '@src/modules/authentication/applications/dto/me.output';
import { HostAccessOutput } from '@src/modules/authentication/applications/dto/host-access.output';
import { UserProfileOutput } from '@src/modules/authentication/applications/dto/user-profile.output';
import { buildJwtPayload } from '@src/modules/authentication/domain/utils/build-jwt-payload';
import type { Property } from '@src/modules/properties/contracts';
import type { EnsurePropertyOwnerHostRoleService } from '@src/modules/authentication/applications/services/ensure-property-owner-host-role.service';
import type { GetMeQuery } from '@src/modules/authentication/applications/useCase/queries/GetMeQuery';

export class GetMeQueryHandler implements IQueryHandler<GetMeQuery, MeOutput> {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly userRepository: IUserRepository,
    private readonly propertyRepository: IPropertyRepository,
    private readonly ensurePropertyOwnerHostRole: EnsurePropertyOwnerHostRoleService,
  ) {}

  async execute(query: GetMeQuery): Promise<MeOutput> {
    let auth = await this.authRepository.findById(query.authId);

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
        auth = (await this.authRepository.findById(query.authId)) ?? auth;
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
