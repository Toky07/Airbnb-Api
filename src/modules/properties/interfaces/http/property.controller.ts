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
import { ListPropertyUseCase } from '../../applications/useCase/listProperty.usecase';
import { ListPropertyOptionsUseCase } from '../../applications/useCase/listPropertyOptions.usecase';
import { parsePaginationQuery } from '../../../../shared/pagination/parse-pagination-query';
import type { PaginatedResult } from '../../../../shared/pagination/pagination.types';
import { PropertyOutput } from '../../applications/dto/property.outup';
import { FindOnePropertyUseCase } from '../../applications/useCase/findOneProperty.usecase';
import type { CreatePropertyDto } from '../../applications/dto/createProperty.dto';
import { CreatePropertyUseCase } from '../../applications/useCase/createProperty.usecase';
import { UpdatePropertyUseCase } from '../../applications/useCase/updateProperty.usecase';
import { DeletePropertyUseCase } from '../../applications/useCase/deleteProperty.usecase';
import { parsePropertyBody } from './parse-property-body';
import type { UploadFile } from '../../../media/types/upload-file';
import { RequirePermissions } from '../../../authentication/interfaces/decorators/require-permissions.decorator';

@Controller('properties')
export class PropertyController {
  constructor(
        private readonly listePropertyUseCase: ListPropertyUseCase,
        private readonly listPropertyOptionsUseCase: ListPropertyOptionsUseCase,
    private readonly findPropertyUseCase: FindOnePropertyUseCase,
    private readonly createPropertyUseCase: CreatePropertyUseCase,
    private readonly updatePropertyUseCase: UpdatePropertyUseCase,
    private readonly deletePropertyUseCase: DeletePropertyUseCase,
  ) {}

    @Get('options')
    @RequirePermissions('properties.read')
    listOptions(): Promise<PropertyOutput[]> {
        return this.listPropertyOptionsUseCase.execute();
    }

    @Get()
    @RequirePermissions('properties.read')
    findAll(
        @Query() query: Record<string, unknown>,
    ): Promise<PaginatedResult<PropertyOutput>> {
        return this.listePropertyUseCase.execute(parsePaginationQuery(query));
    }

    @Get(':id')
  @RequirePermissions('properties.read')
  findById(@Param('id') id: number): Promise<PropertyOutput> {
    return this.findPropertyUseCase.execute(id);
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
    return this.createPropertyUseCase.execute(createPropertyDto, image);
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
    return this.updatePropertyUseCase.execute(id, updatePropertyDto, image);
  }

  @Delete(':id')
  @RequirePermissions('properties.delete')
  delete(@Param('id') id: number): Promise<boolean> {
    return this.deletePropertyUseCase.execute(id);
  }
}
