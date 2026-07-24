import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { UserMapper } from '../mappers/user.mapper';
import { AuthEntity } from '../../../authentication/infrastructure/entity/auth.entity';
import {
  buildPaginationMeta,
  type PaginatedResult,
  type PaginationParams,
} from '../../../../shared/pagination/pagination.types';
import type { AccountStatus } from '../../../authentication/domain/constants/account-status.constant';

export const USER_REPOSITORY = 'UserRepository';

@Injectable()
export class UserRepository implements IUserRepository {
  private readonly authRelations = ['auth', 'auth.roles'] as const;

  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
    @InjectRepository(AuthEntity)
    private readonly authRepository: Repository<AuthEntity>,
  ) {}

  async create(user: User): Promise<User> {
    const data = this.repository.create(UserMapper.toEntity(user));
    const newUser = await this.repository.save(data);
    return this.loadById(newUser.id) as Promise<User>;
  }

  async update(user: User): Promise<User> {
    const data = await this.repository.preload({
      ...UserMapper.toEntity(user),
      id: +user.id!,
    });

    if (!data) {
      throw new NotFoundException('User not found');
    }

    await this.repository.save(data);
    return this.loadById(data.id) as Promise<User>;
  }

  async findById(id: number): Promise<User | null> {
    return this.loadById(Number(id));
  }

  async findAll(): Promise<User[]> {
    const users = await this.repository.find({
      relations: [...this.authRelations],
      order: { lastName: 'ASC', firstName: 'ASC' },
    });

    const enriched = await Promise.all(
      users.map((user) => this.resolveAuthAccount(user)),
    );

    return enriched.map((user) => UserMapper.toDomain(user));
  }

  async findPaginated(
    params: PaginationParams,
  ): Promise<PaginatedResult<User>> {
    const qb = this.repository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.auth', 'auth')
      .leftJoinAndSelect('auth.roles', 'roles')
      .orderBy('user.lastName', 'ASC')
      .addOrderBy('user.firstName', 'ASC');

    if (params.search) {
      const term = `%${params.search}%`;
      qb.andWhere(
        '(user.firstName LIKE :term OR user.lastName LIKE :term OR user.email LIKE :term OR user.phoneNumber LIKE :term)',
        { term },
      );
    }

    const [entities, total] = await qb
      .skip((params.page - 1) * params.limit)
      .take(params.limit)
      .getManyAndCount();

    const enriched = await Promise.all(
      entities.map((entity) => this.resolveAuthAccount(entity)),
    );

    return {
      data: enriched.map((entity) => UserMapper.toDomain(entity)),
      meta: buildPaginationMeta(total, params.page, params.limit),
    };
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(Number(id));
    return Boolean(result.affected && result.affected > 0);
  }

  async linkAuthAccount(userId: number, authId: number): Promise<void> {
    const result = await this.repository.update(Number(userId), { authId });
    if (!result.affected) {
      throw new NotFoundException('User not found');
    }
  }

  async findByAuthId(authId: number): Promise<User | null> {
    let user = await this.repository.findOne({
      where: { authId: Number(authId) },
      relations: [...this.authRelations],
    });

    if (!user) {
      const auth = await this.authRepository.findOne({
        where: { id: Number(authId) },
      });

      if (auth?.email) {
        const normalizedEmail = auth.email.trim().toLowerCase();
        user = await this.repository.findOne({
          where: { email: normalizedEmail },
          relations: [...this.authRelations],
        });

        if (!user) {
          user = await this.repository.findOne({
            where: { email: auth.email },
            relations: [...this.authRelations],
          });
        }
      }
    }

    if (!user) {
      return null;
    }

    const enriched = await this.resolveAuthAccount(user);
    return UserMapper.toDomain(enriched);
  }

  async updateStatus(userId: number, status: AccountStatus): Promise<void> {
    const result = await this.repository.update(Number(userId), { status });
    if (!result.affected) {
      throw new NotFoundException('User not found');
    }
  }

  private async loadById(id: number): Promise<User | null> {
    const user = await this.repository.findOne({
      where: { id },
      relations: [...this.authRelations],
    });

    if (!user) {
      return null;
    }

    const enriched = await this.resolveAuthAccount(user);
    return UserMapper.toDomain(enriched);
  }

  /** Links profile to auth by authId or matching email and loads roles. */
  private async resolveAuthAccount(user: UserEntity): Promise<UserEntity> {
    let auth =
      user.auth ??
      (user.authId != null
        ? await this.authRepository.findOne({
            where: { id: user.authId },
            relations: ['roles'],
          })
        : null);

    if (!auth) {
      auth = await this.authRepository.findOne({
        where: { email: user.email.trim().toLowerCase() },
        relations: ['roles'],
      });

      if (!auth) {
        auth = await this.authRepository.findOne({
          where: { email: user.email },
          relations: ['roles'],
        });
      }
    }

    if (!auth) {
      return user;
    }

    user.auth = auth;

    if (user.authId == null) {
      user.authId = auth.id;
      await this.repository.update(user.id, { authId: auth.id });
    }

    return user;
  }
}
