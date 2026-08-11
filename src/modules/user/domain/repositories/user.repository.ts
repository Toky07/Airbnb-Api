import type {
  PaginatedResult,
  PaginationParams,
} from '@src/shared/pagination/pagination.types';
import type { AccountStatus } from '@src/modules/authentication/contracts';
import { User } from '@src/modules/user/domain/entities/user.entity';

export const USER_REPOSITORY = 'UserRepository';

export interface IUserRepository {
  create(user: User): Promise<User>;
  update(user: User): Promise<User>;
  findById(id: number): Promise<User | null>;
  findAll(): Promise<User[]>;
  findPaginated(params: PaginationParams): Promise<PaginatedResult<User>>;
  delete(id: number): Promise<boolean>;
  linkAuthAccount(userId: number, authId: number): Promise<void>;
  findByAuthId(authId: number): Promise<User | null>;
  updateStatus(userId: number, status: AccountStatus): Promise<void>;
}
