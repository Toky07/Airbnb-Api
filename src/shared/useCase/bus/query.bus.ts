import type { IQueryHandler } from './query-handler.interface';

export class QueryBus {
  private handlers = new Map<string, IQueryHandler<unknown, unknown>>();

  register<TQuery, TResult>(
    queryClass: { name: string },
    handler: IQueryHandler<TQuery, TResult>,
  ) {
    this.handlers.set(queryClass.name, handler as IQueryHandler<unknown, unknown>);
  }

  async execute<TResult = unknown>(query: object): Promise<TResult> {
    const handler = this.handlers.get(query.constructor.name);
    if (!handler) {
      throw new Error(`Handler for query ${query.constructor.name} not found`);
    }
    return handler.execute(query) as Promise<TResult>;
  }
}
