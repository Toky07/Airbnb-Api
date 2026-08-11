import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import type { AmenityScope } from '@src/modules/amenity/domain/constants/amenity-scope.constant';
import { Amenity } from '@src/modules/amenity/domain/entities/amenity.entity';
import type { IAmenityRepository } from '@src/modules/amenity/domain/repositories/amenity.repository';
import { AmenityOrmEntity } from '@src/modules/amenity/infrastructure/entities/amenity.orm-entity';
import { PropertyAmenityOrmEntity } from '@src/modules/amenity/infrastructure/entities/property-amenity.orm-entity';
import { RoomAmenityOrmEntity } from '@src/modules/amenity/infrastructure/entities/room-amenity.orm-entity';
import { AmenityMapper } from '@src/modules/amenity/infrastructure/mappers/amenity.mapper';

@Injectable()
export class AmenityRepository implements IAmenityRepository {
  constructor(
    @InjectRepository(AmenityOrmEntity)
    private readonly repository: Repository<AmenityOrmEntity>,
    @InjectRepository(PropertyAmenityOrmEntity)
    private readonly propertyAmenityRepository: Repository<PropertyAmenityOrmEntity>,
    @InjectRepository(RoomAmenityOrmEntity)
    private readonly roomAmenityRepository: Repository<RoomAmenityOrmEntity>,
  ) {}

  async findAll(scope?: AmenityScope): Promise<Amenity[]> {
    const entities = await this.repository.find({
      where: scope ? { scope } : undefined,
      order: { scope: 'ASC', name: 'ASC' },
    });
    return entities.map(AmenityMapper.toDomain);
  }

  async findActive(scope?: AmenityScope): Promise<Amenity[]> {
    const entities = await this.repository.find({
      where: scope ? { scope, isActive: true } : { isActive: true },
      order: { scope: 'ASC', name: 'ASC' },
    });
    return entities.map(AmenityMapper.toDomain);
  }

  async findById(id: number): Promise<Amenity | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? AmenityMapper.toDomain(entity) : null;
  }

  async findByName(name: string, scope: AmenityScope): Promise<Amenity | null> {
    const entity = await this.repository.findOne({
      where: { name, scope },
    });
    return entity ? AmenityMapper.toDomain(entity) : null;
  }

  async findByIds(ids: number[]): Promise<Amenity[]> {
    if (ids.length === 0) {
      return [];
    }

    const entities = await this.repository.find({
      where: { id: In(ids) },
      order: { name: 'ASC' },
    });
    return entities.map(AmenityMapper.toDomain);
  }

  async create(amenity: Amenity): Promise<Amenity> {
    const saved = await this.repository.save(
      this.repository.create(AmenityMapper.toEntity(amenity)),
    );
    return AmenityMapper.toDomain(saved);
  }

  async update(amenity: Amenity): Promise<Amenity> {
    const data = await this.repository.preload({
      ...AmenityMapper.toEntity(amenity),
      id: amenity.id,
    });
    if (!data) {
      throw new Error('Amenity not found');
    }
    const saved = await this.repository.save(data);
    return AmenityMapper.toDomain(saved);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async countPropertyUsages(id: number): Promise<number> {
    return this.propertyAmenityRepository.count({ where: { amenityId: id } });
  }

  async countRoomUsages(id: number): Promise<number> {
    return this.roomAmenityRepository.count({ where: { amenityId: id } });
  }
}
