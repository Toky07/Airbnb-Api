import { Room } from '@src/modules/rooms/domain/entities/room.entity';
import { RoomOutput } from '@src/modules/rooms/applications/dto/room.output';
import { RoomMediaPresenter } from '@src/modules/rooms/applications/presenters/room-media.presenter';
import { GenerateRoomSlugService } from '@src/modules/rooms/applications/services/generate-room-slug.service';

export const mockRoomMediaPresenter = {
  toOutput: async (room: Room, omitOwnerId = false) =>
    RoomOutput.fromDomain(room, [], undefined, [], [], omitOwnerId),
};

export const mockGenerateRoomSlug = {
  execute: async (name: string) => name.toLowerCase().replace(/\s+/g, '-'),
} as unknown as GenerateRoomSlugService;
