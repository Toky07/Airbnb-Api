import type { AddFavoriteDto } from '../../dto/add-favorite.dto';

export class AddFavoriteCommand {
  constructor(
    public readonly authId: number,
    public readonly dto: AddFavoriteDto,
  ) {}
}
