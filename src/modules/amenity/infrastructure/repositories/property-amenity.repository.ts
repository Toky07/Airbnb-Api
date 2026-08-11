import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IPropertyAmenityRepository } from '@src/modules/amenity/domain/repositories/property-amenity.repository';
import { PropertyAmenityOrmEntity } from '@src/modules/amenity/infrastructure/entities/property-amenity.orm-entity';

@Injectable()
export class PropertyAmenityRepository implements IPropertyAmenityRepository {
  constructor(
    @InjectRepository(PropertyAmenityOrmEntity)
    private readonly repository: Repository<PropertyAmenityOrmEntity>,
  ) {}

  async findAmenityIdsByPropertyId(propertyId: number): Promise<number[]> {
    const rows = await this.repository.find({
      where: { propertyId },
      order: { amenityId: 'ASC' },
    });
    return rows.map((row) => row.amenityId);
  }

  async replaceForProperty(
    propertyId: number,
    amenityIds: number[],
  ): Promise<void> {
    await this.repository.manager.transaction(async (manager) => {
      await manager.delete(PropertyAmenityOrmEntity, { propertyId });

      if (amenityIds.length === 0) {
        return;
      }

      const uniqueIds = [...new Set(amenityIds)];
      await manager.save(
        uniqueIds.map((amenityId) =>
          manager.create(PropertyAmenityOrmEntity, { propertyId, amenityId }),
        ),
      );
    });
  }
}
