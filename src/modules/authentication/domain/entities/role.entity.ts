import { UserNameVO } from "src/modules/user/domain/valueObject/username.vo";

export class RoleEntity {
  id: number | undefined;
  name: UserNameVO;
  createdAt: Date;
  updatedAt: Date;

  constructor(name: UserNameVO, id?:number) {
    this.name = name;
    this.id = id ?? undefined;
  }

  public get value(): string {
    return this.name.value;
  }
}
