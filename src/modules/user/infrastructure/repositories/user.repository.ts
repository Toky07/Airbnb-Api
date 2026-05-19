import { Injectable } from "@nestjs/common";
import { User } from "../../domain/entities/user.entity";
import { IUserRepository } from "../../domain/repositories/user.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../entities/user.entity";
import { Repository } from "typeorm";
import { UserMapper } from "../mappers/user.mapper";

export const USER_REPOSITORY = 'UserRepository';

@Injectable()
export class UserRepository implements IUserRepository {
    constructor(@InjectRepository(UserEntity) private readonly repository: Repository<UserEntity>) {}

    async create(user: User): Promise<User> {
        const data = this.repository.create(user);
        
        const newUser = await this.repository.save(data);

        return UserMapper.toDomain(newUser);
    }

    async update(user: User): Promise<User> {
        const data = await this.repository.preload({
            ...UserMapper.toEntity(user),
            id: +user.id!,
        });

        if (!data) {
            throw new Error('User not found');
        }

        const newUser = await this.repository.save(data);

        return UserMapper.toDomain(newUser);
    }

    async findById(id: number): Promise<User|null> {
        const user = await this.repository.findOne({ where: { id: Number(id) } });

        return user ? UserMapper.toDomain(user) : null;
    }

    async findAll(): Promise<User[]> {
        const users = await this.repository.find();

        return users.map(user => UserMapper.toDomain(user));
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.repository.delete(Number(id));
        
        return result.affected ? result.affected > 0 : false;
    }
}
