import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import type { IAuthRepository } from "../../domain/repositories/auth.repository";
import { AuthEntity } from "../entity/auth.entity";
import { AuthMapper } from "../mappers/auth.mappers";
import { Auth } from "../../domain/entities/user.entity";
import { Injectable } from "@nestjs/common";
import { Role } from "../entity/role.entity";

@Injectable()
export class AuthRepository implements IAuthRepository {
    constructor(
        @InjectRepository(AuthEntity) private readonly repository: Repository<AuthEntity>,
        @InjectRepository(Role) private readonly roleRepository: Repository<Role>
    ) {}

    async create(credentials: Auth): Promise<boolean> {
        const data = this.repository.create(AuthMapper.toEntity(credentials));
        const isSaved = await this.repository.save(data);
        return isSaved ? true : false;
    }

    async findByEmail(email: string): Promise<Auth|null> {
        const auth = await this.repository.findOne({ where: { email } });
        return auth ? AuthMapper.toDomain(auth) : null;
    }

    async assignRoles(userId: number, roleId: number[]): Promise<boolean> {
        const auth = await this.repository.findOne({ where: { id: userId } });

        if (!auth) {
            throw new Error('Auth not found');
        }

        auth.roles = [];
        roleId.forEach(async (id: number) => {
            const role = await this.roleRepository.findOne({ where: { id } });
            if (!role) {
                throw new Error('Role not found');
            }

            auth.roles!.push(role);
        });
        
        await this.repository.save(auth);
        return true;
    }
}
