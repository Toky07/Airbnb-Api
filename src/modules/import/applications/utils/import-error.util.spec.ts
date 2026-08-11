import { describe, expect, it } from 'vitest';
import {
  mergeImportEntityResults,
  toImportErrorMessage,
} from './import-error.util';
import { emptyImportEntityResult } from '@src/modules/import/applications/dto/import-entity-result.dto';

describe('import-error.util', () => {
  it('extracts message from Error instances', () => {
    expect(toImportErrorMessage(new Error('Échec'))).toBe('Échec');
    expect(toImportErrorMessage('raw')).toBe('Création impossible.');
  });

  it('merges import entity results', () => {
    const first = emptyImportEntityResult();
    first.created = 2;
    first.errors.push({
      entity: 'user',
      index: 0,
      message: 'invalid',
    });

    const second = emptyImportEntityResult();
    second.created = 1;

    expect(mergeImportEntityResults(first, second)).toEqual({
      created: 3,
      errors: first.errors,
    });
  });
});
