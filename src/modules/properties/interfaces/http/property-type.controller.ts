import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { RequirePermissions } from '../../../authentication/interfaces/decorators/require-permissions.decorator';
import { RequireSuperAdmin } from '../../../authentication/interfaces/decorators/require-superadmin.decorator';
import type {
  CreatePropertyTypeDto,
  UpdatePropertyTypeDto,
} from '../../applications/dto/create-property-type.dto';
import { PropertyTypeOutput } from '../../applications/dto/property-type.output';
import { CommandBus } from '../../../../shared/useCase/bus/bus';
import { QueryBus } from '../../../../shared/useCase/bus/query-bus';
import { CreatePropertyTypeCommand } from '../../applications/useCase/commands/CreatePropertyTypeCommand';
import { UpdatePropertyTypeCommand } from '../../applications/useCase/commands/UpdatePropertyTypeCommand';
import { DeletePropertyTypeCommand } from '../../applications/useCase/commands/DeletePropertyTypeCommand';
import { ListPropertyTypesQuery } from '../../applications/useCase/queries/ListPropertyTypesQuery';
import { ListPropertyTypeOptionsQuery } from '../../applications/useCase/queries/ListPropertyTypeOptionsQuery';

@Controller('property-types')
export class PropertyTypeController {
  @Get()
  @RequireSuperAdmin()
  list(): Promise<PropertyTypeOutput[]> {
    return QueryBus.execute(new ListPropertyTypesQuery());
  }

  @Get('options')
  @RequirePermissions('properties.read')
  listOptions(): Promise<PropertyTypeOutput[]> {
    return QueryBus.execute(new ListPropertyTypeOptionsQuery());
  }

  @Post()
  @RequireSuperAdmin()
  create(@Body() body: CreatePropertyTypeDto): Promise<PropertyTypeOutput> {
    return CommandBus.execute(new CreatePropertyTypeCommand(body));
  }

  @Put(':id')
  @RequireSuperAdmin()
  update(
    @Param('id') id: number,
    @Body() body: UpdatePropertyTypeDto,
  ): Promise<PropertyTypeOutput> {
    return CommandBus.execute(new UpdatePropertyTypeCommand(Number(id), body));
  }

  @Delete(':id')
  @RequireSuperAdmin()
  delete(@Param('id') id: number): Promise<boolean> {
    return CommandBus.execute(new DeletePropertyTypeCommand(Number(id)));
  }
}
