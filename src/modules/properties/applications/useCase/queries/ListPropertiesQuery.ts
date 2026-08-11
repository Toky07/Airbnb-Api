import type { PaginationParams } from '@src/shared/pagination/pagination.types';

export class ListPropertiesQuery {
  constructor(public readonly params: PaginationParams) {}
}
