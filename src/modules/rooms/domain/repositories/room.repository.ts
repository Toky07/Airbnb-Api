import { Room } from "../entities/room.entity";
import { CreateRoomDto } from "../../applications/dto/createRoom.dto";

export interface IRoomRepository {
    create(room: Room): Promise<Room>;
    update(room: Room): Promise<Room>;
    findById(id: number): Promise<Room|null>;
    findAll(): Promise<Room[]>;
    delete(id: number): Promise<boolean>;
}

export const ROOM_REPOSITORY = 'ROOM_REPOSITORY';
