import { InjectRepository } from '@nestjs/typeorm';
import { RoleEntity } from '../../domain/entities/role.entity';
import { IRoleRepository } from '../../domain/repositories/role.repository';
import { In, Repository } from 'typeorm';
import { RoleMapper } from '../mappers/role.mappers';
import { Role } from '../entity/role.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PermissionEntity } from '../entity/permission.entity';
import {
  buildPaginationMeta,
  type PaginatedResult,
  type PaginationParams,
} from '../../../../shared/pagination/pagination.types';

@Injectable()
export class RoleRepository implements IRoleRepository {
  constructor(
    @InjectRepository(Role)
    private readonly repository: Repository<Role>,
    @InjectRepository(PermissionEntity)
    private readonly permissionRepository: Repository<PermissionEntity>,
  ) {}

  async create(role: RoleEntity): Promise<RoleEntity> {
    const data = this.repository.create(RoleMapper.toEntity(role));
    const newRole = await this.repository.save(data);
    return RoleMapper.toDomain(newRole);
  }

  async update(role: RoleEntity): Promise<RoleEntity> {
    const data = await this.repository.preload({
      ...RoleMapper.toEntity(role),
      id: role.id,
    });

    if (!data) {
      throw new NotFoundException('Role not found');
    }

    const newRole = await this.repository.save(data);
    return this.findById(newRole.id) as Promise<RoleEntity>;
  }

  async findAll(): Promise<RoleEntity[]> {
    const roles = await this.repository.find({
      relations: ['permissions'],
      order: { name: 'ASC' },
    });
    return roles.map((role) => RoleMapper.toDomain(role));
  }

  async findPaginated(
    params: PaginationParams,
  ): Promise<PaginatedResult<RoleEntity>> {
    const qb = this.repository
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.permissions', 'permissions')
      .orderBy('role.name', 'ASC');

    if (params.search) {
      const term = `%${params.search}%`;
      qb.andWhere(
        '(role.name LIKE :term OR role.slug LIKE :term OR role.description LIKE :term)',
        { term },
      );
    }

    const [entities, total] = await qb
      .skip((params.page - 1) * params.limit)
      .take(params.limit)
      .getManyAndCount();

    return {
      data: entities.map((entity) => RoleMapper.toDomain(entity)),
      meta: buildPaginationMeta(total, params.page, params.limit),
    };
  }

  async findById(id: number): Promise<RoleEntity | null> {
    const role = await this.repository.findOne({
      where: { id },
      relations: ['permissions'],
    });
    return role ? RoleMapper.toDomain(role) : null;
  }

  async findBySlug(slug: string): Promise<RoleEntity | null> {
    const role = await this.repository.findOne({
      where: { slug },
      relations: ['permissions'],
    });
    return role ? RoleMapper.toDomain(role) : null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return Boolean(result.affected && result.affected > 0);
  }

  async setPermissions(
    roleId: number,
    permissionKeys: string[],
  ): Promise<RoleEntity> {
    const role = await this.repository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const permissions =
      permissionKeys.length === 0
        ? []
        : await this.permissionRepository.find({
            where: { key: In(permissionKeys) },
          });

    if (permissions.length !== permissionKeys.length) {
      throw new NotFoundException('Permission not found');
    }

    role.permissions = permissions;
    await this.repository.save(role);
    return this.findById(roleId) as Promise<RoleEntity>;
  }
}
