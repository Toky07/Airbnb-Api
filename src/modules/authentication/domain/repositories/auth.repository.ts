import { Auth } from '../entities/user.entity';

export interface IAuthRepository {
  create(credentials: Auth): Promise<boolean>;
  createPending(email: string): Promise<Auth | null>;
  findByEmail(email: string): Promise<Auth | null>;
  findById(id: number): Promise<Auth | null>;
  assignRoles(userId: number, roleId: number[]): Promise<boolean>;
  activateWithPassword(authId: number, passwordHash: string): Promise<void>;
}

export const AUTH_REPOSITORY = 'AUTH_REPOSITORY';
