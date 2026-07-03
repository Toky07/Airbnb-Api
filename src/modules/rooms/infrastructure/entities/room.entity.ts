import { PropertyEntity } from '../../../properties/infrastructure/entities/property-entity.entity';
import { RoomTypeEntity } from './room-type.entity';
import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

@Entity({ name: 'rooms' })
export class RoomEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true, nullable: true })
  slug: string;

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

  @ManyToOne(() => PropertyEntity, (property) => property.rooms)
  @JoinColumn({ name: 'propertyId' })
  property: PropertyEntity;

  @Column({ nullable: true })
  roomTypeId: number | null;

  @ManyToOne(() => RoomTypeEntity, (roomType) => roomType.rooms, {
    nullable: true,
  })
  @JoinColumn({ name: 'roomTypeId' })
  roomType?: RoomTypeEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
