import { describe, expect, it, vi } from 'vitest';
import { RoomStayPricingService } from './room-stay-pricing.service';
import { Room } from '../../domain/entities/room.entity';
import type { IRoomRateOverrideRepository } from '../../domain/repositories/room-rate-override.repository';
import { ResolveDynamicStayAmountService } from '../../../../shared/pricing/resolve-dynamic-stay-amount.service';

describe('RoomStayPricingService', () => {
  const room = new Room({
    id: 1,
    name: 'Suite',
    pricePerNight: 100,
    weekendPricePerNight: 120,
  });

  it('delegates pricing to ResolveDynamicStayAmountService with overrides', async () => {
    const rateOverrideRepository = {
      findOverlapping: vi.fn().mockResolvedValue([
        {
          startDate: '2026-09-01',
          endDate: '2026-09-03',
          pricePerNight: 150,
        },
      ]),
    } as unknown as IRoomRateOverrideRepository;

    const resolveDynamicStayAmount = {
      resolve: vi.fn().mockReturnValue({ totalCents: 30_000 }),
    } as unknown as ResolveDynamicStayAmountService;

    const service = new RoomStayPricingService(
      resolveDynamicStayAmount,
      rateOverrideRepository,
    );

    const result = await service.resolveForRoom(
      room,
      '2026-09-01',
      '2026-09-04',
    );

    expect(rateOverrideRepository.findOverlapping).toHaveBeenCalledWith(
      1,
      '2026-09-01',
      '2026-09-04',
    );
    expect(resolveDynamicStayAmount.resolve).toHaveBeenCalledWith({
      checkIn: '2026-09-01',
      checkOut: '2026-09-04',
      pricePerNight: 100,
      weekendPricePerNight: 120,
      rateOverrides: [
        {
          startDate: '2026-09-01',
          endDate: '2026-09-03',
          pricePerNight: 150,
        },
      ],
    });
    expect(result).toEqual({ totalCents: 30_000 });
  });
});
