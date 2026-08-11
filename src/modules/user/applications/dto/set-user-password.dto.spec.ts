import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { parseSetUserPasswordBody } from './set-user-password.dto';

describe('parseSetUserPasswordBody', () => {
  it('accepte un mot de passe valide et trimme', () => {
    expect(parseSetUserPasswordBody({ password: '  secret1  ' })).toEqual({
      password: 'secret1',
    });
  });

  it('rejette un mot de passe manquant', () => {
    expect(() => parseSetUserPasswordBody({})).toThrow(BadRequestException);
    expect(() => parseSetUserPasswordBody({ password: '   ' })).toThrow(
      BadRequestException,
    );
  });

  it('rejette un mot de passe trop court', () => {
    expect(() => parseSetUserPasswordBody({ password: '12345' })).toThrow(
      BadRequestException,
    );
  });
});
