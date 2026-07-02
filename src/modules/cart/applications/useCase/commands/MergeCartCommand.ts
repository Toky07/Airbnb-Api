export class MergeCartCommand {
  constructor(
    public readonly authId: number,
    public readonly sessionId?: string | null,
  ) {}
}
