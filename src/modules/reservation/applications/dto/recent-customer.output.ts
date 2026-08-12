export class RecentCustomerOutput {
  constructor(
    public readonly id: number,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly email: string,
    public readonly avatar: string,
  ) {}
}
