import { describe, expect, it } from 'vitest';
import {
  CreateRoomCommand,
  ROOM_REPOSITORY,
  ROOM_TYPE_REPOSITORY,
} from './index';

describe('rooms/contracts', () => {
  it('expose tokens et commands publics', () => {
    expect(ROOM_REPOSITORY).toBe('ROOM_REPOSITORY');
    expect(ROOM_TYPE_REPOSITORY).toBe('ROOM_TYPE_REPOSITORY');
    expect(CreateRoomCommand).toBeTypeOf('function');
  });
});
