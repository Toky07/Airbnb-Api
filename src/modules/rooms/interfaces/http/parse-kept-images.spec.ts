import { describe, expect, it } from 'vitest';
import { parseKeptImages } from './parse-kept-images';

describe('parseKeptImages', () => {
  it('retourne undefined si absent', () => {
    expect(parseKeptImages({})).toBeUndefined();
  });

  it('parse un tableau JSON', () => {
    expect(
      parseKeptImages({
        keptImages: JSON.stringify(['uploads/1/room/2/a.jpg']),
      }),
    ).toEqual(['uploads/1/room/2/a.jpg']);
  });
});
