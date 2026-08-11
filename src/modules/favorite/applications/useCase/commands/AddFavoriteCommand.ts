import type { AddFavoriteDto } from '@src/modules/favorite/applications/dto/add-favorite.dto';

export class AddFavoriteCommand {
  constructor(
    public readonly authId: number,
    public readonly dto: AddFavoriteDto,
  ) {}
}
