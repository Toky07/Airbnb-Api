import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  ALL_PERMISSION_KEYS,
  HOST_ROLE_SLUG,
  PERMISSION_DEFINITIONS,
  SUPERADMIN_ROLE_SLUG,
} from '../../domain/constants/permissions.constant';
import { PermissionEntity } from '../entity/permission.entity';
import { Role } from '../entity/role.entity';

@Injectable()
export class AuthRbacSeedService implements OnModuleInit {
  constructor(
    @InjectRepository(PermissionEntity)
    private readonly permissionRepository: Repository<PermissionEntity>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedPermissions();
    await this.seedSuperAdminRole();
    await this.seedHostRole();
  }

  private async seedPermissions(): Promise<void> {
    const existingCount = await this.permissionRepository.count();
    if (existingCount === 0) {
      await this.permissionRepository.insert(PERMISSION_DEFINITIONS);
      return;
    }

    const existingKeys = new Set(
      (
        await this.permissionRepository.find({
          select: { key: true },
        })
      ).map((permission) => permission.key),
    );

    const missing = PERMISSION_DEFINITIONS.filter(
      (definition) => !existingKeys.has(definition.key),
    );

    if (missing.length > 0) {
      await this.permissionRepository.insert(missing);
    }
  }

  private async seedSuperAdminRole(): Promise<void> {
    const role = await this.saveRole(
      SUPERADMIN_ROLE_SLUG,
      'Super administrateur',
      'Accès complet à toutes les fonctionnalités',
    );

    const allPermissions = await this.permissionRepository.find({
      where: { key: In(ALL_PERMISSION_KEYS) },
    });

    role.permissions = allPermissions;
    await this.roleRepository.save(role);
  }

  private async seedHostRole(): Promise<void> {
    const hostPermissionKeys = PERMISSION_DEFINITIONS.filter(
      (definition) => definition.module === 'host',
    ).map((definition) => definition.key);

    const role = await this.saveRole(
      HOST_ROLE_SLUG,
      'Hôte',
      'Gestion de son établissement et de ses chambres',
    );

    const permissions = await this.permissionRepository.find({
      where: { key: In(hostPermissionKeys) },
    });

    role.permissions = permissions;
    await this.roleRepository.save(role);
  }

  private async saveRole(
    slug: string,
    name: string,
    description: string,
  ): Promise<Role> {
    let role = await this.roleRepository.findOne({
      where: { slug },
      relations: ['permissions'],
    });
    if (!role) {
      role = this.roleRepository.create({ slug, name, description });
      role = await this.roleRepository.save(role);
    }

    return role;
  }
}
