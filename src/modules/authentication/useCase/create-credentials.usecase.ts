import { Inject } from "@nestjs/common";
import { AUTH_REPOSITORY } from "../domain/repositories/auth.repository";
import type { IAuthRepository } from "../domain/repositories/auth.repository";
import { EmailVO } from "../../../shared/valueObject/email.vo";
import { Auth } from "../domain/entities/user.entity";
import * as bcrypt from 'bcrypt';

export class CreateCredentialsUseCase {
  constructor(@Inject(AUTH_REPOSITORY) private readonly repository: IAuthRepository) {}

  async execute(credentials: { email: string, password: string }): Promise<boolean> {
    const password = await bcrypt.hash(credentials.password, 10);
    return this.repository.create(new Auth(new EmailVO(credentials.email), password));
  }
}
