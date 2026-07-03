import type { IQueryHandler } from '../../../../shared/useCase/bus/query-handler.interface';
import { PERMISSION_DEFINITIONS } from '../../domain/constants/permissions.constant';
import { PermissionOutput } from '../../application/dto/permission.output';
import type { ListPermissionsQuery } from '../queries/ListPermissionsQuery';

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
