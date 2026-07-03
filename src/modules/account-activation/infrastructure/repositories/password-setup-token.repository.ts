import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository } from 'typeorm';
import type {
  IPasswordSetupTokenRepository,
  PasswordSetupTokenRecord,
} from '../../domain/repositories/password-setup-token.repository';
import { PasswordSetupTokenOrmEntity } from '../entities/password-setup-token.orm-entity';
import { AuthMapper } from '../../../authentication/infrastructure/mappers/auth.mappers';

@Injectable()
export class PasswordSetupTokenRepository implements IPasswordSetupTokenRepository {
  constructor(
    @InjectRepository(PasswordSetupTokenOrmEntity)
    private readonly repository: Repository<PasswordSetupTokenOrmEntity>,
  ) {}

  async create(
    authId: number,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<PasswordSetupTokenRecord> {
    await this.invalidatePendingForAuth(authId);

    const saved = await this.repository.save(
      this.repository.create({
        authId,
        tokenHash,
        expiresAt,
        consumedAt: null,
      }),
    );

    return this.toRecord(saved);
  }

  async findValidByHash(
    tokenHash: string,
  ): Promise<PasswordSetupTokenRecord | null> {
    const token = await this.repository.findOne({
      where: {
        tokenHash,
        consumedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      relations: ['auth', 'auth.roles', 'auth.roles.permissions'],
    });

    return token ? this.toRecord(token) : null;
  }

  async consume(id: number): Promise<void> {
    await this.repository.update(id, { consumedAt: new Date() });
  }

  async invalidatePendingForAuth(authId: number): Promise<void> {
    await this.repository.update(
      { authId, consumedAt: IsNull() },
      { consumedAt: new Date() },
    );
  }

  private toRecord(
    entity: PasswordSetupTokenOrmEntity,
  ): PasswordSetupTokenRecord {
    return {
      id: entity.id,
      authId: entity.authId,
      tokenHash: entity.tokenHash,
      expiresAt: entity.expiresAt,
      consumedAt: entity.consumedAt,
      auth: entity.auth ? AuthMapper.toDomain(entity.auth) : null,
    };
  }
}
