import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../authentication/interfaces/decorators/require-permissions.decorator';
import { RequireSuperAdmin } from '../../../authentication/interfaces/decorators/require-superadmin.decorator';
import { PropertyTypeOutput } from '../../applications/dto/property-type.output';
import { CommandBus } from '../../../../shared/useCase/bus/bus';
import { QueryBus } from '../../../../shared/useCase/bus/query-bus';
import { CreatePropertyTypeCommand } from '../../applications/useCase/commands/CreatePropertyTypeCommand';
import { UpdatePropertyTypeCommand } from '../../applications/useCase/commands/UpdatePropertyTypeCommand';
import { DeletePropertyTypeCommand } from '../../applications/useCase/commands/DeletePropertyTypeCommand';
import { ListPropertyTypesQuery } from '../../applications/useCase/queries/ListPropertyTypesQuery';
import { ListPropertyTypeOptionsQuery } from '../../applications/useCase/queries/ListPropertyTypeOptionsQuery';
import {
  CreatePropertyTypeSwaggerDto,
  UpdatePropertyTypeSwaggerDto,
} from '../../../../shared/swagger/swagger-schemas.dto';
import { ApiJwtAuth } from '../../../../shared/swagger/swagger.decorators';
import { SWAGGER_TAGS } from '../../../../shared/swagger/swagger.constants';

@ApiTags(SWAGGER_TAGS.PROPERTY_TYPES)
@Controller('property-types')
export class PropertyTypeController {
  @Get()
  @RequireSuperAdmin()
  @ApiJwtAuth()
  @ApiOperation({
    summary: "Lister tous les types d'établissement (SuperAdmin)",
  })
  list(): Promise<PropertyTypeOutput[]> {
    return QueryBus.execute(new ListPropertyTypesQuery());
  }

  @Get('options')
  @RequirePermissions('properties.read')
  @ApiJwtAuth()
  @ApiOperation({ summary: "Options types d'établissement" })
  listOptions(): Promise<PropertyTypeOutput[]> {
    return QueryBus.execute(new ListPropertyTypeOptionsQuery());
  }

  @Post()
  @RequireSuperAdmin()
  @ApiJwtAuth()
  @ApiOperation({ summary: "Créer un type d'établissement" })
  create(
    @Body() body: CreatePropertyTypeSwaggerDto,
  ): Promise<PropertyTypeOutput> {
    return CommandBus.execute(new CreatePropertyTypeCommand(body));
  }

  @Put(':id')
  @RequireSuperAdmin()
  @ApiJwtAuth()
  @ApiOperation({ summary: "Modifier un type d'établissement" })
  update(
    @Param('id') id: number,
    @Body() body: UpdatePropertyTypeSwaggerDto,
  ): Promise<PropertyTypeOutput> {
    return CommandBus.execute(new UpdatePropertyTypeCommand(Number(id), body));
  }

  @Delete(':id')
  @RequireSuperAdmin()
  @ApiJwtAuth()
  @ApiOperation({ summary: "Supprimer un type d'établissement" })
  delete(@Param('id') id: number): Promise<boolean> {
    return CommandBus.execute(new DeletePropertyTypeCommand(Number(id)));
  }
}
