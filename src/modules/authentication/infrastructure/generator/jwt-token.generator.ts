import { TokenGenerator } from '@src/modules/authentication/domain/generator/token.generator';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { IAuthRepository } from '@src/modules/authentication/domain/repositories/auth.repository';
import { AUTH_REPOSITORY } from '@src/modules/authentication/domain/repositories/auth.repository';
import { buildJwtPayload } from '@src/modules/authentication/domain/utils/build-jwt-payload';
import { ACCOUNT_STATUS } from '@src/modules/authentication/domain/constants/account-status.constant';

@Injectable()
export class JwtTokenGenerator implements TokenGenerator {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(AUTH_REPOSITORY) private readonly authRepository: IAuthRepository,
  ) {}

  async generate({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<string> {
    const auth = await this.authRepository.findByEmail(email);

    if (!auth?.id || auth.status === ACCOUNT_STATUS.DISABLED) {
      throw new UnauthorizedException('Identifiants invalides.');
    }

    if (!auth.password || auth.status !== ACCOUNT_STATUS.ACTIVE) {
      throw new UnauthorizedException('Identifiants invalides.');
    }

    if (!(await bcrypt.compare(password, auth.password))) {
      throw new UnauthorizedException('Identifiants invalides.');
    }

    return this.jwtService.signAsync(buildJwtPayload(auth));
  }

  async generateForAuthId(authId: number): Promise<string> {
    const auth = await this.authRepository.findById(authId);

    if (!auth?.id || auth.status === ACCOUNT_STATUS.DISABLED) {
      throw new UnauthorizedException('Compte non activé.');
    }

    return this.jwtService.signAsync(buildJwtPayload(auth));
  }
}
