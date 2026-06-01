import { UserNameVO } from "../../../user/domain/valueObject/username.vo";
import { RoleEntity } from "../../domain/entities/role.entity";

export class RoleMapper {
    static toEntity(domain: RoleEntity): any {
        return {
            ...(domain.id && { id: domain.id }),
            name: domain.name.value,
        };
    }

    static toDomain(entity: any): RoleEntity {
        return new RoleEntity(new UserNameVO(entity.name), entity.id);
    }
}