import { Auth } from "../entities/user.entity";

export interface IAuthRepository {
  create(credentials: Auth): Promise<boolean>;
  findByEmail(email: string): Promise<Auth|null>;
}

export const AUTH_REPOSITORY = 'AUTH_REPOSITORY';
