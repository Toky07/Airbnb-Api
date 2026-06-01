import { RoleEntity } from "../entities/role.entity";

export interface IRoleRepository {
    create(role: RoleEntity): Promise<RoleEntity>;
    update(role: RoleEntity): Promise<RoleEntity>;
    findAll(): Promise<RoleEntity[]>;
    findById(id: number): Promise<RoleEntity | null>;
    delete(id: number): Promise<boolean>;
}

export const ROLE_REPOSITORY = 'ROLE_REPOSITORY';
