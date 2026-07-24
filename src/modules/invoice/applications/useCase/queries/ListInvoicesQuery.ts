import type { PaginationParams } from '../../../../../shared/pagination/pagination.types';

export class ListInvoicesQuery {
  constructor(public readonly params: PaginationParams) {}
}
