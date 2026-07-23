import { describe, expect, it } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { validateBlockedDateRange } from './validate-blocked-date-range';

describe('validateBlockedDateRange', () => {
  it('accepte une plage valide', () => {
    expect(validateBlockedDateRange('2026-08-01', '2026-08-05')).toEqual({
      startDate: '2026-08-01',
      endDate: '2026-08-05',
    });
  });

  it('rejette un format invalide', () => {
    expect(() => validateBlockedDateRange('01/08/2026', '2026-08-05')).toThrow(
      BadRequestException,
    );
  });

  it('rejette une fin antérieure ou égale au début', () => {
    expect(() => validateBlockedDateRange('2026-08-05', '2026-08-01')).toThrow(
      BadRequestException,
    );
    expect(() => validateBlockedDateRange('2026-08-01', '2026-08-01')).toThrow(
      BadRequestException,
    );
  });
});
