import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository } from 'typeorm';
import type {
  IPasswordResetTokenRepository,
  PasswordResetTokenRecord,
} from '@src/modules/authentication/domain/repositories/password-reset-token.repository';
import { PasswordResetTokenOrmEntity } from '@src/modules/authentication/infrastructure/entities/password-reset-token.orm-entity';
import { AuthMapper } from '@src/modules/authentication/infrastructure/mappers/auth.mappers';

@Injectable()
export class PasswordResetTokenRepository implements IPasswordResetTokenRepository {
  constructor(
    @InjectRepository(PasswordResetTokenOrmEntity)
    private readonly repository: Repository<PasswordResetTokenOrmEntity>,
  ) {}

  async create(
    authId: number,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<PasswordResetTokenRecord> {
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
  ): Promise<PasswordResetTokenRecord | null> {
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
    entity: PasswordResetTokenOrmEntity,
  ): PasswordResetTokenRecord {
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
