import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { parseCartContext } from './parse-cart-context';

describe('parseCartContext', () => {
  it('accepte une session UUID v4', () => {
    expect(
      parseCartContext({
        headers: { 'x-cart-session': '11111111-1111-4111-8111-111111111111' },
      }),
    ).toEqual({
      sessionId: '11111111-1111-4111-8111-111111111111',
      authId: null,
    });
  });

  it('rejette une session non UUID', () => {
    expect(() =>
      parseCartContext({
        headers: { 'x-cart-session': 'guest-cart-session-e2e' },
      }),
    ).toThrow(BadRequestException);
  });
});
