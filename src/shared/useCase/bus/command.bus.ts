import type { ICommandHandler } from './command-handler.interface';

export class CommandBus {
  private handlers = new Map<string, ICommandHandler<unknown, unknown>>();

  register<TCommand, TResult = void>(
    commandClass: { name: string },
    handler: ICommandHandler<TCommand, TResult>,
  ) {
    this.handlers.set(commandClass.name, handler);
  }

  async execute<T = void>(command: object): Promise<T> {
    const handler = this.handlers.get(command.constructor.name);
    if (!handler) {
      throw new Error(
        `Handler for command ${command.constructor.name} not found`,
      );
    }
    return handler.execute(command) as Promise<T>;
  }
}
