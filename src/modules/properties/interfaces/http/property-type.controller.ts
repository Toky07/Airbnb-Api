import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { RequirePermissions } from '../../../authentication/interfaces/decorators/require-permissions.decorator';
import { RequireSuperAdmin } from '../../../authentication/interfaces/decorators/require-superadmin.decorator';
import type {
  CreatePropertyTypeDto,
  UpdatePropertyTypeDto,
} from '../../applications/dto/create-property-type.dto';
import { PropertyTypeOutput } from '../../applications/dto/property-type.output';
import { CreatePropertyTypeUseCase } from '../../applications/useCase/create-property-type.usecase';
import { DeletePropertyTypeUseCase } from '../../applications/useCase/delete-property-type.usecase';
import { ListPropertyTypeOptionsUseCase } from '../../applications/useCase/list-property-type-options.usecase';
import { ListPropertyTypesUseCase } from '../../applications/useCase/list-property-types.usecase';
import { UpdatePropertyTypeUseCase } from '../../applications/useCase/update-property-type.usecase';

@Controller('property-types')
export class PropertyTypeController {
  constructor(
    private readonly listPropertyTypesUseCase: ListPropertyTypesUseCase,
    private readonly listPropertyTypeOptionsUseCase: ListPropertyTypeOptionsUseCase,
    private readonly createPropertyTypeUseCase: CreatePropertyTypeUseCase,
    private readonly updatePropertyTypeUseCase: UpdatePropertyTypeUseCase,
    private readonly deletePropertyTypeUseCase: DeletePropertyTypeUseCase,
  ) {}

  @Get()
  @RequireSuperAdmin()
  list(): Promise<PropertyTypeOutput[]> {
    return this.listPropertyTypesUseCase.execute();
  }

  @Get('options')
  @RequirePermissions('properties.read')
  listOptions(): Promise<PropertyTypeOutput[]> {
    return this.listPropertyTypeOptionsUseCase.execute();
  }

  @Post()
  @RequireSuperAdmin()
  create(@Body() body: CreatePropertyTypeDto): Promise<PropertyTypeOutput> {
    return this.createPropertyTypeUseCase.execute(body);
  }

  @Put(':id')
  @RequireSuperAdmin()
  update(
    @Param('id') id: number,
    @Body() body: UpdatePropertyTypeDto,
  ): Promise<PropertyTypeOutput> {
    return this.updatePropertyTypeUseCase.execute(Number(id), body);
  }

  @Delete(':id')
  @RequireSuperAdmin()
  delete(@Param('id') id: number): Promise<boolean> {
    return this.deletePropertyTypeUseCase.execute(Number(id));
  }
}
