import { Room } from '../../../domain/entities/room.entity';
import { RoomOutput } from '../../dto/room.output';
import { RoomMediaPresenter } from '../../presenters/room-media.presenter';
import { GenerateRoomSlugService } from '../../services/generate-room-slug.service';

export const mockRoomMediaPresenter = {
  toOutput: async (room: Room) => RoomOutput.fromDomain(room),
};

export const mockGenerateRoomSlug = {
  execute: async (name: string) => name.toLowerCase().replace(/\s+/g, '-'),
} as unknown as GenerateRoomSlugService;
