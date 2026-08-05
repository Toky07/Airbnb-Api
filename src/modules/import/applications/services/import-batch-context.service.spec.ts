import { describe, expect, it, vi } from 'vitest';
import {
  ImportBatchContextService,
  buildPropertyKey,
} from './import-batch-context.service';

describe('ImportBatchContextService', () => {
  it('builds a lookup context from existing data', async () => {
    const service = new ImportBatchContextService(
      {
        findAll: vi.fn().mockResolvedValue([
          { id: 1, email: 'Host@Example.com' },
        ]),
      } as never,
      {
        findAll: vi.fn().mockResolvedValue([
          { id: 10, ownerId: 1, name: 'Hotel Central' },
        ]),
      } as never,
      {
        findAll: vi.fn().mockResolvedValue([{ slug: 'hotel' }]),
      } as never,
      {
        findAll: vi.fn().mockResolvedValue([{ slug: 'suite' }]),
      } as never,
    );

    const context = await service.create();

    expect(context.emailToUserId.get('host@example.com')).toBe(1);
    expect(
      context.propertyKeyToId.get(buildPropertyKey(1, 'Hotel Central')),
    ).toBe(10);
    expect(context.propertyNameToId.get('Hotel Central')).toBe(10);
    expect(context.propertyTypeSlugs.has('hotel')).toBe(true);
    expect(context.roomTypeSlugs.has('suite')).toBe(true);
  });
});

describe('buildPropertyKey', () => {
  it('combines owner and property name', () => {
    expect(buildPropertyKey(3, 'Villa')).toBe('3|Villa');
  });
});
