export class FindRoomQuery {
  constructor(public readonly lookup: { id: number } | { slug: string }) {}
}
