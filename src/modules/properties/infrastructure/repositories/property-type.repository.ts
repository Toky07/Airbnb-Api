import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PropertyType } from '@src/modules/properties/domain/entities/property-type.entity';
import type { IPropertyTypeRepository } from '@src/modules/properties/domain/repositories/property-type.repository';
import { PropertyTypeEntity } from '@src/modules/properties/infrastructure/entities/property-type.entity';
import { PropertyTypeMapper } from '@src/modules/properties/infrastructure/mappers/property-type.mapper';

@Injectable()
export class PropertyTypeRepository implements IPropertyTypeRepository {
  constructor(
    @InjectRepository(PropertyTypeEntity)
    private readonly repository: Repository<PropertyTypeEntity>,
  ) {}

  async findAll(): Promise<PropertyType[]> {
    const entities = await this.repository.find({
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
    return entities.map(PropertyTypeMapper.toDomain);
  }

  async findActive(): Promise<PropertyType[]> {
    const entities = await this.repository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
    return entities.map(PropertyTypeMapper.toDomain);
  }

  async findById(id: number): Promise<PropertyType | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? PropertyTypeMapper.toDomain(entity) : null;
  }

  async findBySlug(slug: string): Promise<PropertyType | null> {
    const entity = await this.repository.findOne({ where: { slug } });
    return entity ? PropertyTypeMapper.toDomain(entity) : null;
  }

  async create(type: PropertyType): Promise<PropertyType> {
    const saved = await this.repository.save(
      this.repository.create(PropertyTypeMapper.toEntity(type)),
    );
    return PropertyTypeMapper.toDomain(saved);
  }

  async update(type: PropertyType): Promise<PropertyType> {
    const data = await this.repository.preload({
      ...PropertyTypeMapper.toEntity(type),
      id: type.id,
    });
    if (!data) {
      throw new Error('Property type not found');
    }
    const saved = await this.repository.save(data);
    return PropertyTypeMapper.toDomain(saved);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async countUsages(id: number): Promise<number> {
    return this.repository.manager
      .createQueryBuilder()
      .from('properties', 'property')
      .where('property.propertyTypeId = :id', { id })
      .getCount();
  }
}
