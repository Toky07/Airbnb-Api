import { slugify } from './slug.util';

describe('slugify', () => {
  it('normalizes names to slugs', () => {
    expect(slugify('Guest House')).toBe('guest-house');
    expect(slugify('Junior Suite')).toBe('junior-suite');
  });
});
