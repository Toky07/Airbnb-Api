import { PropertyOutput } from '@src/modules/properties/contracts';

export class HostProfileOutput {
  constructor(
    public readonly user: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
    },
    public readonly properties: PropertyOutput[],
  ) {}
}
