import { RoleEntity } from '../../domain/entities/role.entity';

export class RoleOutput {
  constructor(
    public readonly id: number,
    public readonly slug: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly permissionKeys: string[],
  ) {}

  public static fromDomain(role: RoleEntity): RoleOutput {
    return new RoleOutput(
      role.id!,
      role.slug,
      role.name.value,
      role.description ?? null,
      role.permissionKeys ?? [],
    );
  }
}
