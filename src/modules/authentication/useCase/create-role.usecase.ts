import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { ROLE_REPOSITORY } from '../domain/repositories/role.repository';
import type { IRoleRepository } from '../domain/repositories/role.repository';
import { RoleEntity } from '../domain/entities/role.entity';
import { CreateRoleDto } from '../application/dto/create-role.dto';
import { UserNameVO } from '../../user/domain/valueObject/username.vo';
import { RoleOutput } from '../application/dto/role.output';
import { slugifyRole } from '../infrastructure/utils/slugify-role';

@Injectable()
export class CreateRoleUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY) private readonly repository: IRoleRepository,
  ) {}

  async execute(createRoleDto: CreateRoleDto): Promise<RoleOutput> {
    const slug = createRoleDto.slug?.trim() || slugifyRole(createRoleDto.name);
    const existing = await this.repository.findBySlug(slug);

    if (existing) {
      throw new ConflictException('Un rôle avec ce slug existe déjà');
    }

    const role = new RoleEntity(
      new UserNameVO(createRoleDto.name),
      slug,
      undefined,
      createRoleDto.description ?? null,
    );
    const newRole = await this.repository.create(role);

    return RoleOutput.fromDomain(newRole);
  }
}
