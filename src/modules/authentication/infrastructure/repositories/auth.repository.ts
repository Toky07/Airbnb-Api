import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import type { IAuthRepository } from '@src/modules/authentication/domain/repositories/auth.repository';
import { AuthEntity } from '@src/modules/authentication/infrastructure/entity/auth.entity';
import { AuthMapper } from '@src/modules/authentication/infrastructure/mappers/auth.mappers';
import { Auth } from '@src/modules/authentication/domain/entities/user.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@src/modules/authentication/infrastructure/entity/role.entity';
import {
  ACCOUNT_STATUS,
  type AccountStatus,
} from '@src/modules/authentication/domain/constants/account-status.constant';

@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor(
    @InjectRepository(AuthEntity)
    private readonly repository: Repository<AuthEntity>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  private readonly relations = ['roles', 'roles.permissions'] as const;

  async create(credentials: Auth): Promise<boolean> {
    const data = this.repository.create(AuthMapper.toEntity(credentials));
    const isSaved = await this.repository.save(data);
    return Boolean(isSaved);
  }

  async createPending(email: string): Promise<Auth | null> {
    const normalizedEmail = email.trim().toLowerCase();
    const entity = this.repository.create({
      email: normalizedEmail,
      password: null,
      status: ACCOUNT_STATUS.PENDING,
    });
    const saved = await this.repository.save(entity);
    return this.findById(saved.id);
  }

  async activateWithPassword(
    authId: number,
    passwordHash: string,
  ): Promise<void> {
    await this.repository.update(authId, {
      password: passwordHash,
      status: ACCOUNT_STATUS.ACTIVE,
    });
  }

  async updatePassword(authId: number, passwordHash: string): Promise<void> {
    await this.repository.update(authId, {
      password: passwordHash,
    });
  }

  async updateStatus(authId: number, status: AccountStatus): Promise<void> {
    const result = await this.repository.update(authId, { status });
    if (!result.affected) {
      throw new NotFoundException('Auth not found');
    }
  }

  async findByEmail(email: string): Promise<Auth | null> {
    const normalizedEmail = email.trim().toLowerCase();
    const auth = await this.repository.findOne({
      where: { email: normalizedEmail },
      relations: [...this.relations],
    });
    return auth ? AuthMapper.toDomain(auth) : null;
  }

  async findById(id: number): Promise<Auth | null> {
    const auth = await this.repository.findOne({
      where: { id },
      relations: [...this.relations],
    });
    return auth ? AuthMapper.toDomain(auth) : null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(Number(id));
    return Boolean(result.affected && result.affected > 0);
  }

  async countWithRoleSlug(slug: string): Promise<number> {
    return this.repository
      .createQueryBuilder('auth')
      .innerJoin('auth.roles', 'role')
      .where('role.slug = :slug', { slug })
      .getCount();
  }

  async assignRoles(userId: number, roleIds: number[]): Promise<boolean> {
    const auth = await this.repository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!auth) {
      throw new NotFoundException('Auth not found');
    }

    const roles =
      roleIds.length === 0
        ? []
        : await this.roleRepository.find({
            where: { id: In(roleIds) },
            relations: ['permissions'],
          });

    if (roles.length !== roleIds.length) {
      throw new NotFoundException('Role not found');
    }

    auth.roles = roles;
    await this.repository.save(auth);
    return true;
  }
}
