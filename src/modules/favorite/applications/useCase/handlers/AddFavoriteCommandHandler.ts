import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import type { IRoomRepository } from '@src/modules/rooms/contracts';
import type { IFavoriteRepository } from '@src/modules/favorite/domain/repositories/favorite.repository';
import { Favorite } from '@src/modules/favorite/domain/entities/favorite.entity';
import { FavoriteOutput } from '@src/modules/favorite/applications/dto/favorite.output';
import type { RoomMediaPresenter } from '@src/modules/rooms/contracts';
import type { AddFavoriteCommand } from '@src/modules/favorite/applications/useCase/commands/AddFavoriteCommand';
import { ResolveAuthenticatedUserService } from '@src/shared/auth/resolve-authenticated-user.service';

export class AddFavoriteCommandHandler implements ICommandHandler<
  AddFavoriteCommand,
  FavoriteOutput
> {
  constructor(
    private readonly favoriteRepository: IFavoriteRepository,
    private readonly roomRepository: IRoomRepository,
    private readonly roomMediaPresenter: RoomMediaPresenter,
    private readonly resolveAuthenticatedUserService: ResolveAuthenticatedUserService,
  ) {}

  async execute(command: AddFavoriteCommand): Promise<FavoriteOutput> {
    const userId = await this.resolveAuthenticatedUserService.resolveUserId(
      command.authId,
    );

    const room = await this.roomRepository.findById(command.dto.roomId);
    if (!room) {
      throw new NotFoundException('Chambre introuvable.');
    }

    const existing = await this.favoriteRepository.findByUserAndRoom(
      userId,
      command.dto.roomId,
    );
    if (existing) {
      throw new BadRequestException('Ce logement est déjà dans vos favoris.');
    }

    const favorite = await this.favoriteRepository.create(
      new Favorite(undefined, userId, command.dto.roomId, undefined),
    );
    const roomOutput = await this.roomMediaPresenter.toOutput(room);

    return FavoriteOutput.fromFavorite(favorite, roomOutput);
  }
}
