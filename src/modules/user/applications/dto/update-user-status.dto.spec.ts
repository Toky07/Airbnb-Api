import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { parseUpdateUserStatusBody } from './update-user-status.dto';

describe('parseUpdateUserStatusBody', () => {
  it('accepte active et disabled (trim)', () => {
    expect(parseUpdateUserStatusBody({ status: ' active ' })).toEqual({
      status: 'active',
    });
    expect(parseUpdateUserStatusBody({ status: 'disabled' })).toEqual({
      status: 'disabled',
    });
  });

  it('rejette un statut invalide', () => {
    expect(() => parseUpdateUserStatusBody({})).toThrow(BadRequestException);
    expect(() => parseUpdateUserStatusBody({ status: 'banned' })).toThrow(
      BadRequestException,
    );
  });
});
