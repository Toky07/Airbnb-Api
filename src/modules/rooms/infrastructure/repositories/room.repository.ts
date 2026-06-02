import { Room } from "../../domain/entities/room.entity";
import { RoomEntity } from "../entities/room.entity";
import { IRoomRepository } from "../../domain/repositories/room.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RoomMapper } from "../mappers/room.mapper";

export class RoomRepository implements IRoomRepository {
    constructor(@InjectRepository(RoomEntity) private readonly repository: Repository<RoomEntity>) {}

    async create(room: Room): Promise<Room> {
        const data = this.repository.create(room);
        const newRoom = await this.repository.save(data);

        return RoomMapper.toDomain(newRoom);
    }

    async findAll(): Promise<Room[]> {
        const rooms = await this.repository.find();
        return rooms.map(room => RoomMapper.toDomain(room));
    }

    async findById(id: number): Promise<Room|null> {
        const room = await this.repository.findOne({ where: { id: Number(id) } });

        return room ? RoomMapper.toDomain(room) : null;
    }

    async update(room: Room): Promise<Room> {
        const data = await this.repository.preload({
            ...RoomMapper.toEntity(room),
            id: +room.id!,
        });

        if (!data) {
            throw new Error('Room not found');
        }

        const newRoom = await this.repository.save(data);

        return RoomMapper.toDomain(newRoom);
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.repository.delete(id);
        return result.affected ? true : false;
    }
}
