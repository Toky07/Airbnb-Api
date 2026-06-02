import { RoomOutput } from "../../../rooms/applications/dto/room.output";
import { Property } from "../../domain/entities/property.entity";
import { Room } from "../../../rooms/domain/entities/room.entity";

export class PropertyOutput {
    constructor(
        public id: number,
        public name: string,
        public description: string,
        public address: string,
        public city: string,
        public country: string,
        public latitude: number,
        public longitude: number,
        public checkInTime: string,
        public checkOutTime: string,
        public ownerId: number,
        public rooms: RoomOutput[],
        public createdAt: Date,
        public updatedAt: Date,
    ) {}

    static fromDomain(property: Property): PropertyOutput {
        return new PropertyOutput(
            property.id!,
            property.name,
            property.description,
            property.address,
            property.city,
            property.country,
            property.latitude,
            property.longitude,
            property.checkInTime,
            property.checkOutTime,
            property.ownerId,
            property.rooms.map((r: Room) => RoomOutput.fromDomain(r)),
            property.createdAt!,
            property.updatedAt!,
        );
    }
}