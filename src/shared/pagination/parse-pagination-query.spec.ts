import { describe, expect, it } from 'vitest';
import { parsePaginationQuery } from './parse-pagination-query';

describe('parsePaginationQuery', () => {
  it('uses defaults', () => {
    expect(parsePaginationQuery({})).toEqual({ page: 1, limit: 10, search: undefined });
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
});
