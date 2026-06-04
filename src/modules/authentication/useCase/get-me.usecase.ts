import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AUTH_REPOSITORY } from '../domain/repositories/auth.repository';
import type { IAuthRepository } from '../domain/repositories/auth.repository';
import { MeOutput } from '../application/dto/me.output';
import { buildJwtPayload } from '../domain/utils/build-jwt-payload';

@Injectable()
export class GetMeUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: IAuthRepository,
  ) {}

  async execute(authId: number): Promise<MeOutput> {
    const auth = await this.authRepository.findById(authId);

    if (!auth?.id) {
      throw new UnauthorizedException();
    }

    const payload = buildJwtPayload(auth);
    return new MeOutput(
      payload.sub,
      payload.email,
      payload.roles,
      payload.permissions,
      payload.isSuperAdmin,
    );
  }
}
