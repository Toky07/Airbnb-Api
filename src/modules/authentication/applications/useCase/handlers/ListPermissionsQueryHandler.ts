import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import { PERMISSION_DEFINITIONS } from '@src/modules/authentication/domain/constants/permissions.constant';
import { PermissionOutput } from '@src/modules/authentication/applications/dto/permission.output';
import type { ListPermissionsQuery } from '@src/modules/authentication/applications/useCase/queries/ListPermissionsQuery';

export class ListPermissionsQueryHandler implements IQueryHandler<
  ListPermissionsQuery,
  PermissionOutput[]
> {
  async execute(_query: ListPermissionsQuery): Promise<PermissionOutput[]> {
    return PERMISSION_DEFINITIONS.map(
      (p) => new PermissionOutput(p.key, p.label, p.module),
    );
  }
}
