import type { PaginationParams } from '../../../../shared/pagination/pagination.types';

export class ListRolesQuery {
  constructor(public readonly params: PaginationParams) {}
}
