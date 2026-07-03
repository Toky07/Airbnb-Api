import { beforeEach, vi } from 'vitest';

export const commandBusExecuteMock = vi.fn();

beforeEach(() => {
  commandBusExecuteMock.mockReset();
  commandBusExecuteMock.mockResolvedValue(undefined);
});
