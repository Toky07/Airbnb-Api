import { PropertyOutput } from '../../../properties/applications/dto/property.outup';

export class HostProfileOutput {
  constructor(
    public readonly user: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
    },
    public readonly property: PropertyOutput | null,
  ) {}
}
