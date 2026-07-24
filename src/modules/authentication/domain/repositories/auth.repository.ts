import type { AccountStatus } from '../constants/account-status.constant';
import { Auth } from '../entities/user.entity';

export interface IAuthRepository {
  create(credentials: Auth): Promise<boolean>;
  createPending(email: string): Promise<Auth | null>;
  findByEmail(email: string): Promise<Auth | null>;
  findById(id: number): Promise<Auth | null>;
  assignRoles(userId: number, roleId: number[]): Promise<boolean>;
  activateWithPassword(authId: number, passwordHash: string): Promise<void>;
  updatePassword(authId: number, passwordHash: string): Promise<void>;
  updateStatus(authId: number, status: AccountStatus): Promise<void>;
  delete(id: number): Promise<boolean>;
}

export const AUTH_REPOSITORY = 'AUTH_REPOSITORY';
