import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { UserMapper } from '../mappers/user.mapper';
import { AuthEntity } from '../../../authentication/infrastructure/entity/auth.entity';

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
