import { User } from '../entities/user.entity';

export interface IUserRepository {
  create(user: User): Promise<User>;
  update(user: User): Promise<User>;
  findById(id: number): Promise<User | null>;
  findAll(): Promise<User[]>;
  delete(id: number): Promise<boolean>;
  linkAuthAccount(userId: number, authId: number): Promise<void>;
}
