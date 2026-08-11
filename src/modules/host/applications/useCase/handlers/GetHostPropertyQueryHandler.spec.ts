import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GetHostPropertyQueryHandler } from './GetHostPropertyQueryHandler';
import { GetHostPropertyQuery } from '@src/modules/host/applications/useCase/queries/GetHostPropertyQuery';
import {
  authUser,
  createPropertyPresenterMock,
  createResolveHostPropertyMock,
  propertyOutput,
} from './host-test.helpers';

describe('GetHostPropertyQueryHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retourne un établissement possédé', async () => {
    const resolveHostProperty = createResolveHostPropertyMock();
    const propertyPresenter = createPropertyPresenterMock();
    const handler = new GetHostPropertyQueryHandler(
      resolveHostProperty as never,
      propertyPresenter,
    );

    const result = await handler.execute(new GetHostPropertyQuery(authUser, 1));

    expect(result).toEqual(propertyOutput);
    expect(resolveHostProperty.requireOwned).toHaveBeenCalledWith(authUser, 1);
  });
});
