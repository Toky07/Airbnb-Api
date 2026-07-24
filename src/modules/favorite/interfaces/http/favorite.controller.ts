import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { CommandBus } from '../../../../shared/useCase/bus/bus';
import { QueryBus } from '../../../../shared/useCase/bus/query-bus';
import type { JwtPayload } from '../../../authentication/domain/types/jwt-payload';
import { AddFavoriteDto } from '../../applications/dto/add-favorite.dto';
import { AddFavoriteCommand } from '../../applications/useCase/commands/AddFavoriteCommand';
import { RemoveFavoriteCommand } from '../../applications/useCase/commands/RemoveFavoriteCommand';
import { ListMyFavoritesQuery } from '../../applications/useCase/queries/ListMyFavoritesQuery';
import { CheckFavoritesQuery } from '../../applications/useCase/queries/CheckFavoritesQuery';

@Controller('favorites')
export class FavoriteController {
  @Get('me')
  listMine(@Req() request: { user?: JwtPayload }) {
    return QueryBus.execute(new ListMyFavoritesQuery(request.user!.sub));
  }

  @Post()
  add(@Req() request: { user?: JwtPayload }, @Body() dto: AddFavoriteDto) {
    return CommandBus.execute(new AddFavoriteCommand(request.user!.sub, dto));
  }

  @Delete(':roomId')
  remove(
    @Req() request: { user?: JwtPayload },
    @Param('roomId', ParseIntPipe) roomId: number,
  ) {
    return CommandBus.execute(
      new RemoveFavoriteCommand(request.user!.sub, roomId),
    );
  }

  @Get('check')
  check(
    @Req() request: { user?: JwtPayload },
    @Query('roomIds') roomIds: string,
  ) {
    const ids = (roomIds ?? '')
      .split(',')
      .map((value) => Number(value.trim()))
      .filter((id) => Number.isInteger(id) && id > 0);

    return QueryBus.execute(new CheckFavoritesQuery(request.user!.sub, ids));
  }
}
