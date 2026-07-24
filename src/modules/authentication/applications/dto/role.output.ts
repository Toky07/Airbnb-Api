import { RoleEntity } from '../../domain/entities/role.entity';
import { isSystemRoleSlug } from '../../domain/constants/system-roles.constant';

export class RoleOutput {
  constructor(
    public readonly id: number,
    public readonly slug: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly permissionKeys: string[],
    public readonly isSystem: boolean,
  ) {}

  public static fromDomain(role: RoleEntity): RoleOutput {
    return new RoleOutput(
      role.id!,
      role.slug,
      role.name.value,
      role.description ?? null,
      role.permissionKeys ?? [],
      isSystemRoleSlug(role.slug),
    );
  }
}
