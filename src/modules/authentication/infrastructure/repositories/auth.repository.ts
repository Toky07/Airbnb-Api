import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import type { IAuthRepository } from "../../domain/repositories/auth.repository";
import { AuthEntity } from "../entity/auth.entity";
import { AuthMapper } from "../mappers/auth.mappers";
import { Auth } from "../../domain/entities/user.entity";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AuthRepository implements IAuthRepository {
    constructor(@InjectRepository(AuthEntity) private readonly repository: Repository<AuthEntity>) {}

    async create(credentials: Auth): Promise<boolean> {
        const data = this.repository.create(AuthMapper.toEntity(credentials));
        const isSaved = await this.repository.save(data);
        return isSaved ? true : false;
    }

    async findByEmail(email: string): Promise<Auth|null> {
        const auth = await this.repository.findOne({ where: { email } });
        return auth ? AuthMapper.toDomain(auth) : null;
    }
}
