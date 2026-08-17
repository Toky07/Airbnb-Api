import { BadRequestException } from '@nestjs/common';

export const MIN_PASSWORD_LENGTH = 8;

export function assertPasswordPolicy(password: string): void {
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    throw new BadRequestException(
      `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`,
    );
  }

  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    throw new BadRequestException(
      'Le mot de passe doit contenir au moins une lettre et un chiffre.',
    );
  }
}
