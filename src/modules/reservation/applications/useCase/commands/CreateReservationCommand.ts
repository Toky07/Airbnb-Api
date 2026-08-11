import type { CreateReservationDto } from '@src/modules/reservation/applications/dto/create-reservation.dto';

export class CreateReservationCommand {
  constructor(
    public readonly authId: number,
    public readonly dtos: CreateReservationDto[],
  ) {}
}
