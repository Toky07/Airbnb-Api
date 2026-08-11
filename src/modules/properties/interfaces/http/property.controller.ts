import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { parsePaginationQuery } from '../../../../shared/pagination/parse-pagination-query';
import type { PaginatedResult } from '../../../../shared/pagination/pagination.types';
import { PropertyOutput } from '../../applications/dto/property.output';
import type { CreatePropertyDto } from '../../applications/dto/createProperty.dto';
import { parsePropertyBody } from './parse-property-body';
import type { UploadFile } from '../../../media/contracts';
import { RequirePermissions } from '../../../authentication/contracts';
import { CommandBus } from '../../../../shared/useCase/bus/bus';
import { QueryBus } from '../../../../shared/useCase/bus/query-bus';
import { CreatePropertyCommand } from '../../applications/useCase/commands/CreatePropertyCommand';
import { UpdatePropertyCommand } from '../../applications/useCase/commands/UpdatePropertyCommand';
import { DeletePropertyCommand } from '../../applications/useCase/commands/DeletePropertyCommand';
import { FindPropertyQuery } from '../../applications/useCase/queries/FindPropertyQuery';
import { ListPropertiesQuery } from '../../applications/useCase/queries/ListPropertiesQuery';
import { ListPropertyOptionsQuery } from '../../applications/useCase/queries/ListPropertyOptionsQuery';
import {
  ApiJwtAuth,
  ApiPaginationQuery,
} from '../../../../shared/swagger/swagger.decorators';
import { SWAGGER_TAGS } from '../../../../shared/swagger/swagger.constants';

@ApiTags(SWAGGER_TAGS.PROPERTIES)
@ApiJwtAuth()
@Controller('properties')
export class PropertyController {
  @Get('options')
  @RequirePermissions('properties.read')
  @ApiOperation({ summary: 'Options établissements pour formulaires' })
  listOptions(): Promise<PropertyOutput[]> {
    return QueryBus.execute(new ListPropertyOptionsQuery());
  }

  @Get()
  @RequirePermissions('properties.read')
  @ApiOperation({ summary: 'Liste paginée des établissements' })
  @ApiPaginationQuery()
  findAll(
    @Query() query: Record<string, unknown>,
  ): Promise<PaginatedResult<PropertyOutput>> {
    return QueryBus.execute(
      new ListPropertiesQuery(parsePaginationQuery(query)),
    );
  }

  @Get(':id')
  @RequirePermissions('properties.read')
  @ApiOperation({ summary: "Détail d'un établissement" })
  findById(@Param('id') id: number): Promise<PropertyOutput> {
    return QueryBus.execute(new FindPropertyQuery(id));
  }

  @Post()
  @RequirePermissions('properties.create')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Créer un établissement' })
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() body: CreatePropertyDto | Record<string, unknown>,
    @UploadedFile() image?: UploadFile,
  ): Promise<PropertyOutput> {
    const createPropertyDto =
      typeof (body as CreatePropertyDto).latitude === 'number'
        ? (body as CreatePropertyDto)
        : parsePropertyBody(body);
    return CommandBus.execute(
      new CreatePropertyCommand(createPropertyDto, image),
    );
  }

  @Put(':id')
  @RequirePermissions('properties.update')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Modifier un établissement' })
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id') id: number,
    @Body() body: CreatePropertyDto | Record<string, unknown>,
    @UploadedFile() image?: UploadFile,
  ): Promise<PropertyOutput> {
    const updatePropertyDto =
      typeof (body as CreatePropertyDto).latitude === 'number'
        ? (body as CreatePropertyDto)
        : parsePropertyBody(body);
    return CommandBus.execute(
      new UpdatePropertyCommand(id, updatePropertyDto, image),
    );
  }

  @Delete(':id')
  @RequirePermissions('properties.delete')
  @ApiOperation({ summary: 'Supprimer un établissement' })
  delete(@Param('id') id: number): Promise<boolean> {
    return CommandBus.execute(new DeletePropertyCommand(id));
  }
}
