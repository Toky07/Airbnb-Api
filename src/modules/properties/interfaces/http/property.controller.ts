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
import { parsePaginationQuery } from '../../../../shared/pagination/parse-pagination-query';
import type { PaginatedResult } from '../../../../shared/pagination/pagination.types';
import { PropertyOutput } from '../../applications/dto/property.outup';
import type { CreatePropertyDto } from '../../applications/dto/createProperty.dto';
import { parsePropertyBody } from './parse-property-body';
import type { UploadFile } from '../../../media/types/upload-file';
import { RequirePermissions } from '../../../authentication/interfaces/decorators/require-permissions.decorator';
import { CommandBus } from '../../../../shared/useCase/bus/bus';
import { QueryBus } from '../../../../shared/useCase/bus/query-bus';
import { CreatePropertyCommand } from '../../applications/useCase/commands/CreatePropertyCommand';
import { UpdatePropertyCommand } from '../../applications/useCase/commands/UpdatePropertyCommand';
import { DeletePropertyCommand } from '../../applications/useCase/commands/DeletePropertyCommand';
import { FindPropertyQuery } from '../../applications/useCase/queries/FindPropertyQuery';
import { ListPropertiesQuery } from '../../applications/useCase/queries/ListPropertiesQuery';
import { ListPropertyOptionsQuery } from '../../applications/useCase/queries/ListPropertyOptionsQuery';

@Controller('properties')
export class PropertyController {
  @Get('options')
  @RequirePermissions('properties.read')
  listOptions(): Promise<PropertyOutput[]> {
    return QueryBus.execute(new ListPropertyOptionsQuery());
  }

  @Get()
  @RequirePermissions('properties.read')
  findAll(
    @Query() query: Record<string, unknown>,
  ): Promise<PaginatedResult<PropertyOutput>> {
    return QueryBus.execute(new ListPropertiesQuery(parsePaginationQuery(query)));
  }

  @Get(':id')
  @RequirePermissions('properties.read')
  findById(@Param('id') id: number): Promise<PropertyOutput> {
    return QueryBus.execute(new FindPropertyQuery(id));
  }

  @Post()
  @RequirePermissions('properties.create')
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() body: CreatePropertyDto | Record<string, unknown>,
    @UploadedFile() image?: UploadFile,
  ): Promise<PropertyOutput> {
    const createPropertyDto =
      typeof (body as CreatePropertyDto).latitude === 'number'
        ? (body as CreatePropertyDto)
        : parsePropertyBody(body as Record<string, unknown>);
    return CommandBus.execute(new CreatePropertyCommand(createPropertyDto, image));
  }

  @Put(':id')
  @RequirePermissions('properties.update')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id') id: number,
    @Body() body: CreatePropertyDto | Record<string, unknown>,
    @UploadedFile() image?: UploadFile,
  ): Promise<PropertyOutput> {
    const updatePropertyDto =
      typeof (body as CreatePropertyDto).latitude === 'number'
        ? (body as CreatePropertyDto)
        : parsePropertyBody(body as Record<string, unknown>);
    return CommandBus.execute(
      new UpdatePropertyCommand(id, updatePropertyDto, image),
    );
  }

  @Delete(':id')
  @RequirePermissions('properties.delete')
  delete(@Param('id') id: number): Promise<boolean> {
    return CommandBus.execute(new DeletePropertyCommand(id));
  }
}
