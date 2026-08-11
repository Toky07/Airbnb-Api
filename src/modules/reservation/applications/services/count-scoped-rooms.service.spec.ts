import { describe, expect, it, vi } from 'vitest';
import { CountScopedRoomsService } from './count-scoped-rooms.service';

describe('CountScopedRoomsService', () => {
  it('retourne 0 pour propertyId -1', async () => {
    const roomRepository = { findPaginated: vi.fn() };
    const service = new CountScopedRoomsService(roomRepository as never);

    await expect(service.count({ propertyId: -1 })).resolves.toBe(0);
    expect(roomRepository.findPaginated).not.toHaveBeenCalled();
  });

  it('somme les totaux pour plusieurs propertyIds', async () => {
    const roomRepository = {
      findPaginated: vi
        .fn()
        .mockResolvedValueOnce({ meta: { total: 2 } })
        .mockResolvedValueOnce({ meta: { total: 3 } }),
    };
    const service = new CountScopedRoomsService(roomRepository as never);

    await expect(service.count({ propertyIds: [1, 2] })).resolves.toBe(5);
    expect(roomRepository.findPaginated).toHaveBeenCalledTimes(2);
  });

  it('compte pour un propertyId unique', async () => {
    const roomRepository = {
      findPaginated: vi.fn().mockResolvedValue({ meta: { total: 4 } }),
    };
    const service = new CountScopedRoomsService(roomRepository as never);

    await expect(service.count({ propertyId: 7 })).resolves.toBe(4);
    expect(roomRepository.findPaginated).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      propertyId: 7,
    });
  });

  it('compte globalement sans scope', async () => {
    const roomRepository = {
      findPaginated: vi.fn().mockResolvedValue({ meta: { total: 11 } }),
    };
    const service = new CountScopedRoomsService(roomRepository as never);

    await expect(service.count({})).resolves.toBe(11);
    expect(roomRepository.findPaginated).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
    });
  });
});
