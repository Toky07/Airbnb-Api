import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { PropertyEntity } from '../../../properties/infrastructure/entities/property-entity.entity';
import { AmenityOrmEntity } from './amenity.orm-entity';

@Entity({ name: 'property_amenities' })
export class PropertyAmenityOrmEntity {
  @PrimaryColumn()
  propertyId: number;

  @PrimaryColumn()
  amenityId: number;

  @ManyToOne(() => PropertyEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propertyId' })
  property: PropertyEntity;

  @ManyToOne(() => AmenityOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'amenityId' })
  amenity: AmenityOrmEntity;
}
