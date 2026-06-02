import { PrimaryGeneratedColumn, Column, Entity, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: 'rooms' })
export class RoomEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    pricePerNight: number;

    @Column()
    maxGuests: number;

    @Column()
    bedrooms: number;

    @Column()
    bathrooms: number;

    @Column()
    beds: number;

    @Column()
    quantity: number;

    @Column()
    size: number;

    @Column()
    status: string;

    @Column()
    propertyId: number;

    @CreateDateColumn()
    createdAt: Date;
    
    @UpdateDateColumn()
    updatedAt: Date;
}
