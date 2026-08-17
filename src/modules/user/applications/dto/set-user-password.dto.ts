import { BadRequestException } from '@nestjs/common';
import { assertPasswordPolicy } from '@src/modules/authentication/contracts';

export class SetUserPasswordDto {
  password!: string;
}

export function parseSetUserPasswordBody(
  body: Record<string, unknown>,
): SetUserPasswordDto {
  const password =
    typeof body.password === 'string' ? body.password.trim() : '';

  if (!password) {
    throw new BadRequestException('Le mot de passe est obligatoire.');
  }

  assertPasswordPolicy(password);

  return { password };
}
