import { UserNameVO } from "src/modules/user/domain/valueObject/username.vo";

export class RoleEntity {
  id: string;
  name: UserNameVO;
  createdAt: Date;
  updatedAt: Date;

  constructor(name: UserNameVO) {
    this.name = name;
  }
}
