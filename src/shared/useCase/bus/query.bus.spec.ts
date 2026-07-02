import { describe, expect, it } from 'vitest';
import { QueryBus } from './query.bus';
import type { IQueryHandler } from './query-handler.interface';

class GetGreetingQuery {
  constructor(public readonly name: string) {}
}

class GetGreetingQueryHandler implements IQueryHandler<GetGreetingQuery, string> {
  execute(query: GetGreetingQuery): Promise<string> {
    return Promise.resolve(`Hello, ${query.name}`);
  }
}

describe('QueryBus', () => {
  it('dispatches a query to its registered handler', async () => {
    const bus = new QueryBus();
    bus.register(GetGreetingQuery, new GetGreetingQueryHandler());

    const result = await bus.execute(new GetGreetingQuery('Alice'));

    expect(result).toBe('Hello, Alice');
  });

  it('throws when no handler is registered', async () => {
    const bus = new QueryBus();

    await expect(bus.execute(new GetGreetingQuery('Alice'))).rejects.toThrow(
      'Handler for query GetGreetingQuery not found',
    );
  });
});
