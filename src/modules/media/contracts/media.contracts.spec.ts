import { describe, expect, it } from 'vitest';
import {
  ENTITY_TYPE,
  LOCAL_STORAGE_SERVICE,
  SaveEntityMediasCommand,
  GetMediasByEntityQuery,
  UPLOAD_ROOT,
} from './index';

describe('media/contracts', () => {
  it('expose les constants, tokens et CQRS publics', () => {
    expect(ENTITY_TYPE.ROOM).toBe('room');
    expect(UPLOAD_ROOT).toBe('uploads');
    expect(LOCAL_STORAGE_SERVICE).toBe('LOCAL_STORAGE_SERVICE');
    expect(
      new SaveEntityMediasCommand(ENTITY_TYPE.PROPERTY, 1, []),
    ).toBeInstanceOf(SaveEntityMediasCommand);
    expect(new GetMediasByEntityQuery(ENTITY_TYPE.ROOM, 2)).toBeInstanceOf(
      GetMediasByEntityQuery,
    );
  });
});
