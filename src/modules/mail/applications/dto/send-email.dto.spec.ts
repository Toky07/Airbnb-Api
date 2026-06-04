import { describe, expect, it } from 'vitest';
import { parseRecipientList } from './send-email.dto';

describe('parseRecipientList', () => {
  it('parse une liste séparée par des virgules', () => {
    expect(parseRecipientList('a@test.com, b@test.com')).toEqual([
      'a@test.com',
      'b@test.com',
    ]);
  });

  it('retourne un tableau vide si la valeur est absente', () => {
    expect(parseRecipientList('')).toEqual([]);
    expect(parseRecipientList(undefined)).toEqual([]);
  });
});
