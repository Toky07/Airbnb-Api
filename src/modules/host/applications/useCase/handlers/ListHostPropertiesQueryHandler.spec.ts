import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ListHostPropertiesQueryHandler } from './ListHostPropertiesQueryHandler';
import { ListHostPropertiesQuery } from '@src/modules/host/applications/useCase/queries/ListHostPropertiesQuery';
import {
  authUser,
  createPropertyPresenterMock,
  createResolveHostPropertyMock,
  propertyOutput,
} from './host-test.helpers';

describe('ListHostPropertiesQueryHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('liste les établissements possédés', async () => {
    const resolveHostProperty = createResolveHostPropertyMock();
    const propertyPresenter = createPropertyPresenterMock();
    const handler = new ListHostPropertiesQueryHandler(
      resolveHostProperty as never,
      propertyPresenter,
    );

    const result = await handler.execute(new ListHostPropertiesQuery(authUser));

    expect(result).toEqual([propertyOutput]);
    expect(resolveHostProperty.listOwned).toHaveBeenCalledWith(authUser);
  });
});
