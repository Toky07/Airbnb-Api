import { vi } from 'vitest';
import { commandBusExecuteMock } from './command-bus.mock';

vi.mock('../shared/useCase/bus/bus', async () => {
  // const { commandBusExecuteMock } = await import('./command-bus.mock.ts');
  return {
    CommandBus: {
      execute: commandBusExecuteMock,
    },
  };
});
