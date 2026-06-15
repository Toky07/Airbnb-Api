import { UserNameVO } from '../../../user/domain/valueObject/username.vo';

export class RoleEntity {
  id: number | undefined;
  name: UserNameVO;
  slug: string;
  description?: string | null;
  permissionKeys: string[];
  createdAt: Date;
  updatedAt: Date;

  constructor(
    name: UserNameVO,
    slug: string,
    id?: number,
    description?: string | null,
    permissionKeys: string[] = [],
  ) {
    this.name = name;
    this.slug = slug;
    this.id = id ?? undefined;
    this.description = description;
    this.permissionKeys = permissionKeys;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  public get value(): string {
    return this.name.value;
  }
}
