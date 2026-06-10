import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { RoomEntity } from '../../../rooms/infrastructure/entities/room.entity';
import { AmenityOrmEntity } from './amenity.orm-entity';

@Entity({ name: 'room_amenities' })
export class RoomAmenityOrmEntity {
  @PrimaryColumn()
  roomId: number;

  @PrimaryColumn()
  amenityId: number;

  @ManyToOne(() => RoomEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roomId' })
  room: RoomEntity;

  @ManyToOne(() => AmenityOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'amenityId' })
  amenity: AmenityOrmEntity;
}
