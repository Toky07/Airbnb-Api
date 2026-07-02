import type { PaginationParams } from '../../../../../shared/pagination/pagination.types';

export class ListRoomsQuery {
  constructor(public readonly params: PaginationParams) {}
}
