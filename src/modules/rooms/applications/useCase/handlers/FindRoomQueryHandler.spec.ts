import { IRoomRepository } from '../../../domain/repositories/room.repository';
import type { IRoomBlockedDateRepository } from '../../../domain/repositories/room-blocked-date.repository';
import { Room } from '../../../domain/entities/room.entity';
import { Property } from '../../../../properties/domain/entities/property.entity';
import { RoomDetailResolver } from '../../services/room-detail.resolver';
import { FindRoomQueryHandler } from './FindRoomQueryHandler';
import { FindRoomQuery } from '../queries/FindRoomQuery';
import { mockRoomMediaPresenter } from '../test-helpers/room-usecase.mocks';

const mockExecute = vi.fn();

vi.mock('../../../../../shared/useCase/bus/query-bus', () => ({
  QueryBus: { execute: (...args: unknown[]) => mockExecute(...args) },
}));

const repository = {
  findById: async (): Promise<Room | null> =>
    new Room({
      id: 1,
      name: 'Room 1',
      description: 'Room 1 description',
      pricePerNight: 100,
      maxGuests: 2,
      bedrooms: 1,
      bathrooms: 1,
      beds: 1,
      quantity: 1,
      size: 1,
      status: 'available',
      property: new Property({
        id: 10,
        name: 'P',
        description: 'D',
        address: 'A',
        city: 'C',
        country: 'Co',
        latitude: 0,
        longitude: 0,
        checkInTime: 'in',
        checkOutTime: 'out',
        ownerId: 1,
      }),
    }),
} as IRoomRepository;

const mockQueryBuilder = {
  innerJoin: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  andWhere: vi.fn().mockReturnThis(),
  getMany: vi
    .fn()
    .mockResolvedValue([{ checkIn: '2026-09-10', checkOut: '2026-09-13' }]),
};

const mockReservationRepo = {
  createQueryBuilder: vi.fn().mockReturnValue(mockQueryBuilder),
} as any;

const mockBlockedDateRepo = {
  findByRoomId: vi.fn().mockResolvedValue([
    {
      id: 1,
      roomId: 1,
      startDate: '2026-10-01',
      endDate: '2026-10-05',
      reason: 'Maintenance',
    },
  ]),
  findOverlapping: vi.fn().mockResolvedValue([]),
  findRoomIdsUnavailable: vi.fn().mockResolvedValue([]),
  create: vi.fn(),
  delete: vi.fn(),
  findById: vi.fn(),
} as unknown as IRoomBlockedDateRepository;

function createHandler() {
  const roomDetailResolver = new RoomDetailResolver(
    mockRoomMediaPresenter,
    mockReservationRepo,
    mockBlockedDateRepo,
  );

  return new FindRoomQueryHandler(repository, roomDetailResolver);
}

describe('FindRoomQueryHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExecute.mockImplementation(
      async (query: { constructor: { name: string } }) => {
        if (query.constructor.name === 'ListRoomAmenitiesQuery') {
          return [
            {
              id: 1,
              name: 'WiFi',
              icon: 'wifi',
              scope: 'room',
              isActive: true,
            },
          ];
        }
        if (query.constructor.name === 'ListPropertyAmenitiesQuery') {
          return [
            {
              id: 2,
              name: 'Piscine',
              icon: 'water-ladder',
              scope: 'property',
              isActive: true,
            },
          ];
        }
        return [];
      },
    );
    (
      mockBlockedDateRepo.findByRoomId as ReturnType<typeof vi.fn>
    ).mockResolvedValue([
      {
        id: 1,
        roomId: 1,
        startDate: '2026-10-01',
        endDate: '2026-10-05',
        reason: 'Maintenance',
      },
    ]);
  });

  it('should find one room with unavailable dates', async () => {
    const handler = createHandler();
    const room = await handler.execute(new FindRoomQuery({ id: 1 }));

    expect(room.id).toBe(1);
    expect(room.name).toBe('Room 1');
    expect(room.images).toEqual([]);
    expect(room.unavailableDates).toEqual([
      { startDate: '2026-09-10', endDate: '2026-09-13' },
      { startDate: '2026-10-01', endDate: '2026-10-05' },
    ]);
    expect(room.amenities).toHaveLength(1);
    expect(room.propertyAmenities).toHaveLength(1);
  });

  it('should throw an error if the room is not found', async () => {
    const handler = createHandler();
    vi.spyOn(repository, 'findById').mockResolvedValue(null);

    await expect(handler.execute(new FindRoomQuery({ id: 2 }))).rejects.toThrow(
      'Room not found',
    );
  });
});
