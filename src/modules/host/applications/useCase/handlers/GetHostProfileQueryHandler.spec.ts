import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GetHostProfileQueryHandler } from './GetHostProfileQueryHandler';
import { GetHostProfileQuery } from '../queries/GetHostProfileQuery';
import {
  authUser,
  createPropertyPresenterMock,
  createResolveHostPropertyMock,
  createResolveHostUserMock,
  propertyOutput,
} from './host-test.helpers';

describe('GetHostProfileQueryHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retourne le profil hôte avec ses établissements', async () => {
    const resolveHostUser = createResolveHostUserMock();
    const resolveHostProperty = createResolveHostPropertyMock();
    const propertyPresenter = createPropertyPresenterMock();
    const handler = new GetHostProfileQueryHandler(
      resolveHostUser as never,
      resolveHostProperty as never,
      propertyPresenter,
    );

    const result = await handler.execute(new GetHostProfileQuery(authUser));

    expect(result.user.id).toBe(5);
    expect(result.properties).toEqual([propertyOutput]);
    expect(resolveHostProperty.listOwned).toHaveBeenCalledWith(authUser);
  });
});
