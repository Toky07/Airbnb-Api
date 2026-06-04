import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  ALL_PERMISSION_KEYS,
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
  }

  private async seedPermissions(): Promise<void> {
    for (const definition of PERMISSION_DEFINITIONS) {
      const existing = await this.permissionRepository.findOne({
        where: { key: definition.key },
      });
      if (!existing) {
        await this.permissionRepository.save(
          this.permissionRepository.create(definition),
        );
      }
    }
  }

  private async seedSuperAdminRole(): Promise<void> {
    let role = await this.roleRepository.findOne({
      where: { slug: SUPERADMIN_ROLE_SLUG },
      relations: ['permissions'],
    });

    if (!role) {
      role = this.roleRepository.create({
        slug: SUPERADMIN_ROLE_SLUG,
        name: 'Super administrateur',
        description: 'Accès complet à toutes les fonctionnalités',
      });
      role = await this.roleRepository.save(role);
    }

    const allPermissions = await this.permissionRepository.find({
      where: { key: In(ALL_PERMISSION_KEYS) },
    });

    role.permissions = allPermissions;
    await this.roleRepository.save(role);
  }
}
