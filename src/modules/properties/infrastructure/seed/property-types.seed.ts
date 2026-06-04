import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { slugify } from '../../../../shared/utils/slug.util';
import { PropertyTypeEntity } from '../entities/property-type.entity';

const DEFAULT_PROPERTY_TYPES = [
  'Resort',
  'Guest House',
  'Hostel',
  'Apartment Hotel',
  'Villa',
  'Lodge',
  'Bungalow',
];

@Injectable()
export class PropertyTypesSeedService implements OnModuleInit {
  constructor(
    @InjectRepository(PropertyTypeEntity)
    private readonly repository: Repository<PropertyTypeEntity>,
  ) {}

  async onModuleInit(): Promise<void> {
    for (const [index, name] of DEFAULT_PROPERTY_TYPES.entries()) {
      const slug = slugify(name);
      const existing = await this.repository.findOne({ where: { slug } });
      if (!existing) {
        await this.repository.save(
          this.repository.create({
            name,
            slug,
            sortOrder: index,
            isActive: true,
          }),
        );
      }
    }
  }
}
