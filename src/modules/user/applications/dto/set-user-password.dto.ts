import { BadRequestException } from '@nestjs/common';

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

  if (password.length < 6) {
    throw new BadRequestException(
      'Le mot de passe doit contenir au moins 6 caractères.',
    );
  }

  return { password };
}
