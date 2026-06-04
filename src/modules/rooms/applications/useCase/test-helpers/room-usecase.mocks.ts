import { Room } from '../../../domain/entities/room.entity';
import { RoomOutput } from '../../dto/room.output';
import { RoomMediaPresenter } from '../../presenters/room-media.presenter';
import { SaveEntityMediasUseCase } from '../../../../media/applications/useCase/saveEntityMedias.usecase';
import { SyncEntityMediasUseCase } from '../../../../media/applications/useCase/syncEntityMedias.usecase';
import { DeleteMediasByEntityUseCase } from '../../../../media/applications/useCase/deleteMediasByEntity.usecase';

export const mockSaveEntityMedias = {
  execute: async () => [],
} as unknown as SaveEntityMediasUseCase;

export const mockSyncEntityMedias = {
  execute: async () => [],
} as unknown as SyncEntityMediasUseCase;

export const mockDeleteMediasByEntity = {
  execute: async () => undefined,
} as unknown as DeleteMediasByEntityUseCase;

export const mockRoomMediaPresenter = {
  toOutput: async (room: Room) => RoomOutput.fromDomain(room),
} as RoomMediaPresenter;
