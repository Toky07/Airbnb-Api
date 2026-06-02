import { RoomEntity } from "../../../rooms/infrastructure/entities/room.entity";
import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";

@Entity({ name: 'properties' })
export class PropertyEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    address: string;

    @Column()
    city: string;
    
    @Column()
    country: string;

    @Column()
    latitude: number;

    @Column()
    longitude: number;

    @Column()
    checkInTime: string;

    @Column()
    checkOutTime: string;

    @Column()
    ownerId: number;

    @OneToMany(() => RoomEntity, (room) => room.property)
    rooms: RoomEntity[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
