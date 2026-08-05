import { describe, expect, it } from 'vitest';
import { parseCommaSeparatedIds } from './parse-comma-separated-ids';

describe('parseCommaSeparatedIds', () => {
  it('parses comma-separated positive integers', () => {
    expect(parseCommaSeparatedIds('1, 2,3')).toEqual([1, 2, 3]);
  });

  it('ignores invalid values', () => {
    expect(parseCommaSeparatedIds('1,abc,0,-2,4.5,6')).toEqual([1, 6]);
  });

  it('returns empty array for empty input', () => {
    expect(parseCommaSeparatedIds()).toEqual([]);
    expect(parseCommaSeparatedIds('')).toEqual([]);
  });
});
