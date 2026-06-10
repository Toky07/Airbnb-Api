export class HostAccessOutput {
  constructor(
    public readonly isHost: boolean,
    public readonly hasProperty: boolean,
    public readonly propertyId: number | null,
    public readonly propertyName: string | null,
    public readonly propertyCount: number,
  ) {}
}
