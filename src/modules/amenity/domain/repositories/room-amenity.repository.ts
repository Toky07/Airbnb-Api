export interface IRoomAmenityRepository {
  findAmenityIdsByRoomId(roomId: number): Promise<number[]>;
  replaceForRoom(roomId: number, amenityIds: number[]): Promise<void>;
}

export const ROOM_AMENITY_REPOSITORY = 'ROOM_AMENITY_REPOSITORY';
