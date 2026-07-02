import type { CreateReservationDto } from '../../dto/create-reservation.dto';

export class CreateReservationCommand {
  constructor(
    public readonly authId: number,
    public readonly dtos: CreateReservationDto[],
  ) {}
}
