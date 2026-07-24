import { BadRequestException } from '@nestjs/common';

export class SetUserPasswordDto {
  password!: string;
}

export class UpdateUserStatusDto {
  status!: 'active' | 'disabled';
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

export function parseUpdateUserStatusBody(
  body: Record<string, unknown>,
): UpdateUserStatusDto {
  const status = typeof body.status === 'string' ? body.status.trim() : '';

  if (status !== 'active' && status !== 'disabled') {
    throw new BadRequestException(
      'Le statut doit être « active » ou « disabled ».',
    );
  }

  return { status };
}
