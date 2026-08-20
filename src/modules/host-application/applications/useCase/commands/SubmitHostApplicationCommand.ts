import type { CreateHostApplicationDto } from '@src/modules/host-application/applications/dto/create-host-application.dto';

export class SubmitHostApplicationCommand {
  constructor(
    public readonly authId: number,
    public readonly dto: CreateHostApplicationDto,
  ) {}
}
