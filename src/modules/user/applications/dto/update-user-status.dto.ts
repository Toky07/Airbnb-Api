import { BadRequestException } from '@nestjs/common';

export class UpdateUserStatusDto {
  status!: 'active' | 'disabled';
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
