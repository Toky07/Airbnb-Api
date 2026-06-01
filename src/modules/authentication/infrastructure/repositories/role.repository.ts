import { InjectRepository } from "@nestjs/typeorm";
import { RoleEntity } from "../../domain/entities/role.entity";
import { IRoleRepository } from "../../domain/repositories/role.repository";
import { Repository } from "typeorm";
import { RoleMapper } from "../mappers/role.mappers";
import { Role } from "../entity/role.entity";

export class RoleRepository implements IRoleRepository {
    constructor(@InjectRepository(Role) private readonly repository: Repository<Role>) {}

    async create(role: RoleEntity): Promise<RoleEntity> {
        const data = this.repository.create(RoleMapper.toEntity(role));
        const newRole = await this.repository.save(data);

        return RoleMapper.toDomain(newRole);
    }

    async update(role: RoleEntity): Promise<RoleEntity> {
        const data = await this.repository.preload({
            ...RoleMapper.toEntity(role),
            id: role.id,
        });

        if (!data) {
            throw new Error('Role not found');
        }

        const newRole = await this.repository.save(data);

        return RoleMapper.toDomain(newRole);
    }

    async findAll(): Promise<RoleEntity[]> {
        const roles = await this.repository.find();
        return roles.map((role: Role) => RoleMapper.toDomain(role));
    }

    async findById(id: number): Promise<RoleEntity | null> {
        const role = await this.repository.findOne({ where: { id } });

        return role ? RoleMapper.toDomain(role) : null;
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.repository.delete(id);
        return result.affected && result.affected > 0 ? true : false;
    }
}