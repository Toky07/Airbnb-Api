import { RoomEntity } from "../../../rooms/infrastructure/entities/room.entity";
import { PropertyTypeEntity } from "./property-type.entity";
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
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

    @Column({ nullable: true })
    propertyTypeId: number | null;

    @ManyToOne(() => PropertyTypeEntity, (propertyType) => propertyType.properties, {
        nullable: true,
    })
    @JoinColumn({ name: 'propertyTypeId' })
    propertyType?: PropertyTypeEntity;

    @OneToMany(() => RoomEntity, (room) => room.property)
    rooms: RoomEntity[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
