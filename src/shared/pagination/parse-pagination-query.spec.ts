import { describe, expect, it } from 'vitest';
import { parsePaginationQuery } from './parse-pagination-query';

describe('parsePaginationQuery', () => {
  it('uses defaults', () => {
    expect(parsePaginationQuery({})).toEqual({
      page: 1,
      limit: 10,
      search: undefined,
      propertyId: undefined,
      checkIn: undefined,
      checkOut: undefined,
    });
  });

  it('normalizes invalid limit to 10', () => {
    expect(parsePaginationQuery({ limit: '99' }).limit).toBe(10);
  });

  it('accepts allowed page sizes', () => {
    expect(parsePaginationQuery({ limit: '25' }).limit).toBe(25);
  });

  it('trims search', () => {
    expect(parsePaginationQuery({ search: '  hotel  ' }).search).toBe('hotel');
  });

  it('accepte une plage de dates valide', () => {
    expect(
      parsePaginationQuery({
        checkIn: '2026-08-01',
        checkOut: '2026-08-05',
      }),
    ).toEqual(
      expect.objectContaining({
        checkIn: '2026-08-01',
        checkOut: '2026-08-05',
      }),
    );
  });

  it('ignore une plage de dates invalide', () => {
    expect(
      parsePaginationQuery({
        checkIn: '2026-08-05',
        checkOut: '2026-08-01',
      }),
    ).toEqual(
      expect.objectContaining({
        checkIn: undefined,
        checkOut: undefined,
      }),
    );
  });
});
