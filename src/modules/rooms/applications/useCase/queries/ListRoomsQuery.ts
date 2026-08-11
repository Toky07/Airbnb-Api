import type { PaginationParams } from '@src/shared/pagination/pagination.types';

export class ListRoomsQuery {
  constructor(public readonly params: PaginationParams) {}
}
