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
import { CommandBus } from '../../../../shared/useCase/bus/bus';
import { QueryBus } from '../../../../shared/useCase/bus/query-bus';
import type { AuthenticatedRequest } from '../../../../shared/http/authenticated-request.type';
import { parseCommaSeparatedIds } from '../../../../shared/http/parse-comma-separated-ids';
import { AddFavoriteDto } from '../../applications/dto/add-favorite.dto';
import { AddFavoriteCommand } from '../../applications/useCase/commands/AddFavoriteCommand';
import { RemoveFavoriteCommand } from '../../applications/useCase/commands/RemoveFavoriteCommand';
import { ListMyFavoritesQuery } from '../../applications/useCase/queries/ListMyFavoritesQuery';
import { CheckFavoritesQuery } from '../../applications/useCase/queries/CheckFavoritesQuery';
import { ApiJwtAuth } from '../../../../shared/swagger/swagger.decorators';
import { SWAGGER_TAGS } from '../../../../shared/swagger/swagger.constants';

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
  check(@Req() request: AuthenticatedRequest, @Query('roomIds') roomIds: string) {
    return QueryBus.execute(
      new CheckFavoritesQuery(
        request.user.sub,
        parseCommaSeparatedIds(roomIds),
      ),
    );
  }
}
