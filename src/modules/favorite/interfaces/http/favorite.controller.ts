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
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@src/shared/useCase/bus/bus';
import { QueryBus } from '@src/shared/useCase/bus/query-bus';
import type { AuthenticatedRequest } from '@src/shared/http/authenticated-request.type';
import { parseCommaSeparatedIds } from '@src/shared/http/parse-comma-separated-ids';
import { AddFavoriteDto } from '@src/modules/favorite/applications/dto/add-favorite.dto';
import { AddFavoriteCommand } from '@src/modules/favorite/applications/useCase/commands/AddFavoriteCommand';
import { RemoveFavoriteCommand } from '@src/modules/favorite/applications/useCase/commands/RemoveFavoriteCommand';
import { ListMyFavoritesQuery } from '@src/modules/favorite/applications/useCase/queries/ListMyFavoritesQuery';
import { CheckFavoritesQuery } from '@src/modules/favorite/applications/useCase/queries/CheckFavoritesQuery';
import { ApiJwtAuth } from '@src/shared/swagger/swagger.decorators';
import { SWAGGER_TAGS } from '@src/shared/swagger/swagger.constants';

@ApiTags(SWAGGER_TAGS.FAVORITES)
@ApiJwtAuth()
@Controller('favorites')
export class FavoriteController {
  @Get('me')
  @ApiOperation({ summary: 'Mes chambres favorites' })
  listMine(@Req() request: AuthenticatedRequest) {
    return QueryBus.execute(new ListMyFavoritesQuery(request.user.sub));
  }

  @Post()
  @ApiOperation({ summary: 'Ajouter une chambre aux favoris' })
  add(@Req() request: AuthenticatedRequest, @Body() dto: AddFavoriteDto) {
    return CommandBus.execute(new AddFavoriteCommand(request.user.sub, dto));
  }

  @Delete(':roomId')
  @ApiOperation({ summary: 'Retirer une chambre des favoris' })
  remove(
    @Req() request: AuthenticatedRequest,
    @Param('roomId', ParseIntPipe) roomId: number,
  ) {
    return CommandBus.execute(
      new RemoveFavoriteCommand(request.user.sub, roomId),
    );
  }

  @Get('check')
  @ApiOperation({
    summary: 'Vérifier le statut favori pour plusieurs chambres',
  })
  @ApiQuery({
    name: 'roomIds',
    description: 'IDs séparés par des virgules',
    example: '1,2,3',
  })
  check(
    @Req() request: AuthenticatedRequest,
    @Query('roomIds') roomIds: string,
  ) {
    return QueryBus.execute(
      new CheckFavoritesQuery(
        request.user.sub,
        parseCommaSeparatedIds(roomIds),
      ),
    );
  }
}
