import { Auth } from "../entities/user.entity";

export interface IAuthRepository {
  create(credentials: Auth): Promise<boolean>;
  findByEmail(email: string): Promise<Auth|null>;
  assignRoles(userId: number, roleId: number[]): Promise<boolean>;
}

export const AUTH_REPOSITORY = 'AUTH_REPOSITORY';
