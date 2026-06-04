import { UserNameVO } from '../../../user/domain/valueObject/username.vo';
import { RoleEntity } from '../../domain/entities/role.entity';
import { Role } from '../entity/role.entity';

export class RoleMapper {
  static toEntity(domain: RoleEntity): Partial<Role> {
    return {
      ...(domain.id && { id: domain.id }),
      name: domain.name.value,
      slug: domain.slug,
      description: domain.description ?? null,
    };
  }

  static toDomain(entity: Role): RoleEntity {
    const permissionKeys = (entity.permissions ?? []).map((p) => p.key);
    return new RoleEntity(
      new UserNameVO(entity.name),
      entity.slug,
      entity.id,
      entity.description,
      permissionKeys,
    );
  }
}
