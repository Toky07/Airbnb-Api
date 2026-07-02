import { describe, expect, it } from 'vitest';
import { CommandBus } from './command.bus';
import type { ICommandHandler } from './command-handler.interface';

class PingCommand {
  constructor(public readonly message: string) {}
}

class PingCommandHandler implements ICommandHandler<PingCommand, string> {
  execute(command: PingCommand): Promise<string> {
    return Promise.resolve(`pong:${command.message}`);
  }
}

describe('CommandBus', () => {
  it('dispatches a command to its registered handler', async () => {
    const bus = new CommandBus();
    bus.register(PingCommand, new PingCommandHandler());

    const result = await bus.execute(new PingCommand('hello'));

    expect(result).toBe('pong:hello');
  });

  it('throws when no handler is registered', async () => {
    const bus = new CommandBus();

    await expect(bus.execute(new PingCommand('hello'))).rejects.toThrow(
      'Handler for command PingCommand not found',
    );
  });
});
