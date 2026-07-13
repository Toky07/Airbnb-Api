import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AMENITY_SCOPE } from '../../domain/constants/amenity-scope.constant';
import { AmenityOrmEntity } from '../entities/amenity.orm-entity';

const DEFAULT_PROPERTY_AMENITIES = [
  { name: 'Parking', icon: 'square-parking' },
  { name: 'Restaurant', icon: 'utensils' },
  { name: 'Piscine', icon: 'water-ladder' },
  { name: 'Spa', icon: 'spa' },
  { name: 'Salle de sport', icon: 'dumbbell' },
  { name: 'Bar', icon: 'martini-glass-citrus' },
  { name: 'WiFi gratuit', icon: 'wifi' },
  { name: 'Petit-déjeuner', icon: 'mug-saucer' },
] as const;

const DEFAULT_ROOM_AMENITIES = [
  { name: 'WiFi', icon: 'wifi' },
  { name: 'TV', icon: 'tv' },
  { name: 'Climatisation', icon: 'snowflake' },
  { name: 'Coffre-fort', icon: 'vault' },
  { name: 'Minibar', icon: 'wine-bottle' },
  { name: 'Sèche-cheveux', icon: 'wind' },
  { name: 'Bureau', icon: 'briefcase' },
  { name: 'Balcon', icon: 'door-open' },
] as const;

@Injectable()
export class AmenitiesSeedService implements OnModuleInit {
  constructor(
    @InjectRepository(AmenityOrmEntity)
    private readonly repository: Repository<AmenityOrmEntity>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.backfillMissingScopes();
    await this.seedScope(DEFAULT_PROPERTY_AMENITIES, AMENITY_SCOPE.PROPERTY);
    await this.seedScope(DEFAULT_ROOM_AMENITIES, AMENITY_SCOPE.ROOM);
  }

  private async backfillMissingScopes(): Promise<void> {
    const legacyRoomNames = new Set<string>(
      DEFAULT_ROOM_AMENITIES.map((amenity) => amenity.name),
    );

    const withoutScope = await this.repository
      .createQueryBuilder('amenity')
      .where('amenity.scope IS NULL OR amenity.scope = :empty', { empty: '' })
      .getMany();

    for (const amenity of withoutScope) {
      amenity.scope = legacyRoomNames.has(amenity.name)
        ? AMENITY_SCOPE.ROOM
        : AMENITY_SCOPE.PROPERTY;
      await this.repository.save(amenity);
    }
  }

  private async seedScope(
    amenities: ReadonlyArray<{ name: string; icon: string }>,
    scope: typeof AMENITY_SCOPE.PROPERTY | typeof AMENITY_SCOPE.ROOM,
  ): Promise<void> {
    const existingCount = await this.repository.count({ where: { scope } });
    if (existingCount === 0) {
      await this.repository.insert(
        amenities.map((amenity) => ({
          name: amenity.name,
          icon: amenity.icon,
          scope,
          isActive: true,
        })),
      );
      return;
    }

    for (const amenity of amenities) {
      const existing = await this.repository.findOne({
        where: { name: amenity.name, scope },
      });

      if (!existing) {
        await this.repository.save(
          this.repository.create({
            name: amenity.name,
            icon: amenity.icon,
            scope,
            isActive: true,
          }),
        );
      }
    }
  }
}
