import { PropertyType } from '../../../domain/entities/property-type.entity';
import { ListPropertyTypeOptionsQueryHandler } from './ListPropertyTypeOptionsQueryHandler';
import { ListPropertyTypeOptionsQuery } from '../queries/ListPropertyTypeOptionsQuery';

describe('ListPropertyTypeOptionsQueryHandler', () => {
  it('lists active property types', async () => {
    const repository = {
      findActive: async () => [
        new PropertyType('Hôtel', 'hotel', 0, true, 2, new Date(), new Date()),
      ],
    };

    const handler = new ListPropertyTypeOptionsQueryHandler(
      repository as never,
    );
    const result = await handler.execute(new ListPropertyTypeOptionsQuery());

    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe('Hôtel');
  });
});
