import type { PaginationParams } from '../../../../../shared/pagination/pagination.types';

export class ListPropertiesQuery {
  constructor(public readonly params: PaginationParams) {}
}
