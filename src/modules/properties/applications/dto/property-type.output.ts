import type { PropertyType } from '../../domain/entities/property-type.entity';

export class PropertyTypeOutput {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly slug: string,
    public readonly sortOrder: number,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromDomain(type: PropertyType): PropertyTypeOutput {
    return new PropertyTypeOutput(
      type.id!,
      type.name,
      type.slug,
      type.sortOrder,
      type.isActive,
      type.createdAt!,
      type.updatedAt!,
    );
  }
}
