import { vi } from 'vitest';
import './command-bus.mock';

vi.mock('../shared/useCase/bus/bus', async () => {
  const { commandBusExecuteMock } = await import('./command-bus.mock');
  return {
    CommandBus: {
      execute: commandBusExecuteMock,
    },
  };
});
