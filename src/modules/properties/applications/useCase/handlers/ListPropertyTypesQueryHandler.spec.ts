import { PropertyType } from '@src/modules/properties/domain/entities/property-type.entity';
import { PropertyTypeOutput } from '@src/modules/properties/applications/dto/property-type.output';
import { ListPropertyTypesQueryHandler } from './ListPropertyTypesQueryHandler';
import { ListPropertyTypesQuery } from '@src/modules/properties/applications/useCase/queries/ListPropertyTypesQuery';

describe('ListPropertyTypesQueryHandler', () => {
  it('lists all property types', async () => {
    const repository = {
      findAll: async () => [
        new PropertyType('Villa', 'villa', 0, true, 1, new Date(), new Date()),
      ],
    };

    const handler = new ListPropertyTypesQueryHandler(repository as never);
    const result = await handler.execute(new ListPropertyTypesQuery());

    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(PropertyTypeOutput);
    expect(result[0]?.slug).toBe('villa');
  });
});
