import { PERMISSION_DEFINITIONS } from '@src/modules/authentication/domain/constants/permissions.constant';
import { PermissionOutput } from '@src/modules/authentication/applications/dto/permission.output';
import { ListPermissionsQueryHandler } from './ListPermissionsQueryHandler';
import { ListPermissionsQuery } from '@src/modules/authentication/applications/useCase/queries/ListPermissionsQuery';

describe('ListPermissionsQueryHandler', () => {
  it('should return all permission definitions', async () => {
    const handler = new ListPermissionsQueryHandler();
    const result = await handler.execute(new ListPermissionsQuery());

    expect(result).toHaveLength(PERMISSION_DEFINITIONS.length);
    expect(result[0]).toBeInstanceOf(PermissionOutput);
    expect(result.some((p) => p.key === 'dashboard.read')).toBe(true);
  });
});
