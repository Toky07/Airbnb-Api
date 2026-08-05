import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { ICommandHandler } from '../../../../../shared/useCase/bus/command-handler.interface';
import type { IRoomRepository } from '../../../../rooms/domain/repositories/room.repository';
import type { IFavoriteRepository } from '../../../domain/repositories/favorite.repository';
import { Favorite } from '../../../domain/entities/favorite.entity';
import { FavoriteOutput } from '../../dto/favorite.output';
import type { RoomMediaPresenter } from '../../../../rooms/applications/presenters/room-media.presenter';
import type { AddFavoriteCommand } from '../commands/AddFavoriteCommand';
import { ResolveFavoriteUserService } from '../../services/resolve-favorite-user.service';

export class AddFavoriteCommandHandler implements ICommandHandler<
  AddFavoriteCommand,
  FavoriteOutput
> {
  constructor(
    private readonly favoriteRepository: IFavoriteRepository,
    private readonly roomRepository: IRoomRepository,
    private readonly roomMediaPresenter: RoomMediaPresenter,
    private readonly resolveFavoriteUserService: ResolveFavoriteUserService,
  ) {}

  async execute(command: AddFavoriteCommand): Promise<FavoriteOutput> {
    const userId = await this.resolveFavoriteUserService.resolveUserId(
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
