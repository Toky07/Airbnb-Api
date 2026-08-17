import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { assertPasswordPolicy } from './assert-password-policy';

describe('assertPasswordPolicy', () => {
  it('accepte un mot de passe d’au moins 8 caractères avec lettre et chiffre', () => {
    expect(() => assertPasswordPolicy('secret12')).not.toThrow();
  });

  it('refuse un mot de passe trop court ou sans lettre/chiffre', () => {
    expect(() => assertPasswordPolicy('secret1')).toThrow(BadRequestException);
    expect(() => assertPasswordPolicy('12345678')).toThrow(BadRequestException);
    expect(() => assertPasswordPolicy('abcdefgh')).toThrow(BadRequestException);
  });
});
